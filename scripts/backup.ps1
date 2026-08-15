[CmdletBinding()]
param(
    [ValidateRange(1, 365)]
    [int]$Keep = 14
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Push-Location $ProjectRoot
try {
    docker compose config --quiet
    if ($LASTEXITCODE -ne 0) { throw "Compose configuration validation failed." }
    docker compose --profile tools run --rm backup `
        python -m app.backup create /backups --keep $Keep
    if ($LASTEXITCODE -ne 0) { throw "Backup failed." }
}
finally {
    Pop-Location
}
