[CmdletBinding()]
param(
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Python = Join-Path $ProjectRoot "backend\.venv\Scripts\python.exe"

if (-not (Test-Path -LiteralPath $Python -PathType Leaf)) {
    throw "Backend virtual environment not found at backend\.venv."
}

Push-Location $ProjectRoot
try {
    npm test
    if ($LASTEXITCODE -ne 0) { throw "Frontend tests failed." }
    npm run lint
    if ($LASTEXITCODE -ne 0) { throw "Frontend lint failed." }
    npm run typecheck
    if ($LASTEXITCODE -ne 0) { throw "Frontend typecheck failed." }
    if (-not $SkipBuild) {
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "Frontend build failed." }
    }

    Push-Location (Join-Path $ProjectRoot "backend")
    try {
        & $Python -m pytest --cov=app --cov-report=term-missing
        if ($LASTEXITCODE -ne 0) { throw "Backend tests failed." }
    }
    finally {
        Pop-Location
    }
}
finally {
    Pop-Location
}
