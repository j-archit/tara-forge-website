from pathlib import Path


ROOT = Path(__file__).parents[2]


def read_script(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_development_scripts_migrate_seed_and_clean_up_processes() -> None:
    powershell = read_script("start_dev.ps1")
    shell = read_script("start_dev.sh")

    for script in (powershell, shell):
        assert "docker compose up -d --wait database" in script
        assert "alembic upgrade head" in script
        assert "app.cli seed-defaults" in script
        assert "uvicorn" in script
        assert "Ctrl+C" in script

    assert '-FilePath "npm.cmd" -ArgumentList "run", "dev"' in powershell
    assert "npm run dev" in shell
    assert "finally" in powershell
    assert "Stop-Process" in powershell
    assert "trap cleanup EXIT INT TERM" in shell
    assert 'kill "$backend_pid"' in shell
    assert 'kill "$frontend_pid"' in shell


def test_check_scripts_run_the_complete_verification_suite() -> None:
    powershell = read_script("scripts/check.ps1")
    shell = read_script("scripts/check.sh")

    for script in (powershell, shell):
        assert "npm test" in script
        assert "npm run lint" in script
        assert "npm run typecheck" in script
        assert "npm run build" in script
        assert "pytest --cov=app --cov-report=term-missing" in script

    assert "SkipBuild" in powershell
    assert "--skip-build" in shell


def test_backup_scripts_validate_compose_and_apply_retention() -> None:
    powershell = read_script("scripts/backup.ps1")
    shell = read_script("scripts/backup.sh")

    for script in (powershell, shell):
        assert "docker compose config --quiet" in script
        assert "python -m app.backup create /backups --keep" in script
        assert "365" in script


def test_restore_scripts_require_force_and_stop_every_writer() -> None:
    powershell = read_script("scripts/restore.ps1")
    shell = read_script("scripts/restore.sh")

    for script in (powershell, shell):
        assert "taraforge-backup-" in script
        assert "docker compose stop gateway web backend worker" in script
        assert "python -m app.backup restore" in script
        assert "--force" in script
        assert "Services remain stopped" in script
        assert "docker compose up -d --remove-orphans --wait --wait-timeout 120" in script

    assert "[IO.Path]::GetFileName" in powershell
    assert '[[ "$FORCE" == true ]]' in shell


def test_deploy_scripts_backup_before_pull_build_and_health_wait() -> None:
    powershell = read_script("scripts/deploy.ps1")
    shell = read_script("scripts/deploy.sh")

    for script in (powershell, shell):
        backup = script.index("backup.")
        pull = script.index("git pull --ff-only")
        build = script.index("docker compose build")
        start = script.index("docker compose up -d --remove-orphans --wait --wait-timeout 120")
        assert backup < pull < build < start
        assert "docker compose config --quiet" in script
        assert "git status --porcelain --untracked-files=normal" in script
