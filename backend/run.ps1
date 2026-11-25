$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

$backendPython = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
if (-not (Test-Path -LiteralPath $backendPython)) {
    Write-Error "Backend virtual environment not found. Create it with: python -m venv .venv"
    exit 1
}

try {
    $health = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/projects/" -UseBasicParsing -TimeoutSec 2
    if ($health.StatusCode -eq 200) {
        Write-Host "Kalpbhumi backend is already running at http://127.0.0.1:8000"
        exit 0
    }
} catch {
    # Start the local Django process if no healthy server is listening.
}

& $backendPython manage.py migrate --noinput
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& $backendPython manage.py check
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& $backendPython manage.py runserver 127.0.0.1:8000
exit $LASTEXITCODE
