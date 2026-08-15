from pathlib import Path


ROOT = Path(__file__).parents[2]


def read_script(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_development_scripts_migrate_seed_and_clean_up_processes() -> None:
    powershell = read_script("start_dev.ps1")
    shell = read_script("start_dev.sh")

    for script in (powershell, shell):
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
