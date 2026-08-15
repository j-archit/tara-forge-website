[CmdletBinding()]
param(
    [switch]$SkipPull,
    [switch]$SkipBackup
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Push-Location $ProjectRoot
try {
    if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot ".env") -PathType Leaf)) {
        throw ".env is required before deployment. Copy and configure .env.example."
    }
    docker compose config --quiet
    if ($LASTEXITCODE -ne 0) { throw "Compose configuration validation failed." }

    if (-not $SkipPull) {
        $GitStatus = @(git status --porcelain --untracked-files=normal)
        if ($LASTEXITCODE -ne 0) { throw "Could not inspect the Git worktree." }
        if ($GitStatus.Count -gt 0) { throw "The Git worktree must be clean before deployment." }
    }

    $RunningServices = @(docker compose ps --status running --services)
    if ($LASTEXITCODE -ne 0) { throw "Could not inspect running Compose services." }
    if (-not $SkipBackup -and $RunningServices -contains "backend") {
        & (Join-Path $PSScriptRoot "backup.ps1")
    }
    elseif (-not $SkipBackup) {
        Write-Host "Backend is not running; skipping the pre-deploy backup."
    }

    if (-not $SkipPull) {
        git pull --ff-only
        if ($LASTEXITCODE -ne 0) { throw "Fast-forward Git update failed." }
    }

    docker compose build
    if ($LASTEXITCODE -ne 0) { throw "Image build failed." }
    docker compose up -d --remove-orphans --wait --wait-timeout 120
    if ($LASTEXITCODE -ne 0) { throw "Deployment did not become healthy." }
    docker compose ps
}
finally {
    Pop-Location
}
