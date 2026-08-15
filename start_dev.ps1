[CmdletBinding()]
param(
    [switch]$Install
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$BackendRoot = Join-Path $ProjectRoot "backend"
$Python = Join-Path $BackendRoot ".venv\Scripts\python.exe"

if (-not (Test-Path -LiteralPath $Python -PathType Leaf)) {
    throw "Backend virtual environment not found. Run: py -3 -m venv backend\.venv"
}

if ($Install) {
    & $Python -m pip install --disable-pip-version-check -r (Join-Path $BackendRoot "requirements-dev.txt")
    if ($LASTEXITCODE -ne 0) { throw "Backend dependency installation failed." }
    npm install
    if ($LASTEXITCODE -ne 0) { throw "Frontend dependency installation failed." }
}

Push-Location $BackendRoot
try {
    & $Python -m alembic upgrade head
    if ($LASTEXITCODE -ne 0) { throw "Database migration failed." }
    & $Python -m app.cli seed-defaults
    if ($LASTEXITCODE -ne 0) { throw "Default-data seeding failed." }
}
finally {
    Pop-Location
}

$Backend = $null
$Frontend = $null
try {
    $Backend = Start-Process -FilePath $Python `
        -ArgumentList "-m", "uvicorn", "app.main:app", "--reload", "--port", "8000" `
        -WorkingDirectory $BackendRoot -NoNewWindow -PassThru
    $Frontend = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev" `
        -WorkingDirectory $ProjectRoot -NoNewWindow -PassThru

    Write-Host "TaraForge3D development services are running."
    Write-Host "Website: http://localhost:3000"
    Write-Host "Backend: http://127.0.0.1:8000"
    Write-Host "Press Ctrl+C to stop both services."
    Wait-Process -Id $Backend.Id, $Frontend.Id
}
finally {
    foreach ($Process in @($Backend, $Frontend)) {
        if ($null -ne $Process -and -not $Process.HasExited) {
            Stop-Process -Id $Process.Id
        }
    }
}
