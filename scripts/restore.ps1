[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$Archive,
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ArchiveName = [IO.Path]::GetFileName($Archive)

if (-not $Force) {
    throw "Restore replaces live data. Rerun with -Force after verifying the archive."
}
if ($ArchiveName -ne $Archive -or $ArchiveName -notmatch '^taraforge-backup-[A-Za-z0-9_-]+\.zip$') {
    throw "Archive must be a TaraForge backup filename from the application-backups volume."
}

Push-Location $ProjectRoot
try {
    docker compose config --quiet
    if ($LASTEXITCODE -ne 0) { throw "Compose configuration validation failed." }

    Write-Warning "Stopping the public site and all database writers for restore."
    docker compose stop gateway web backend worker
    if ($LASTEXITCODE -ne 0) { throw "Could not stop application services." }

    docker compose --profile tools run --rm backup `
        python -m app.backup restore "/backups/$ArchiveName" --force
    if ($LASTEXITCODE -ne 0) {
        throw "Restore failed. Services remain stopped; inspect the error before restarting."
    }

    docker compose up -d --remove-orphans --wait --wait-timeout 120
    if ($LASTEXITCODE -ne 0) { throw "Restore completed, but the application did not become healthy." }
}
finally {
    Pop-Location
}
