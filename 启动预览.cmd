@echo off
cd /d "%~dp0"
where python >nul 2>&1
if not errorlevel 1 (
  python "%~dp0preview.py"
  exit /b
)
where py >nul 2>&1
if not errorlevel 1 (
  py -3 "%~dp0preview.py"
  exit /b
)
echo Python 3 is required. You can open index.html directly.
pause
