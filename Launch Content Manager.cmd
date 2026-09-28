@echo off
setlocal
cd /d "%~dp0"
if errorlevel 1 goto :failed

where.exe node >nul 2>&1
if errorlevel 1 (
  echo Node.js is not installed or is not on PATH. Install Node.js 24, then try again.
  goto :failed
)
where.exe npm >nul 2>&1
if errorlevel 1 (
  echo npm is not installed or is not on PATH. Install Node.js 24, then try again.
  goto :failed
)

if not exist "node_modules\sharp\package.json" (
  echo Installing the website dependencies for this first launch...
  call npm ci
  if errorlevel 1 goto :failed
)

echo Starting the local content manager. Keep this window open while editing.
node tools\content-manager\start.mjs
if errorlevel 1 goto :failed
exit /b 0

:failed
echo.
echo The content manager could not start. Review the error above.
pause
exit /b 1
