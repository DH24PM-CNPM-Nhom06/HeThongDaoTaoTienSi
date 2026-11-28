@echo off
setlocal
cd /d "%~dp0"

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
set DTMS_EXIT_CODE=%ERRORLEVEL%

if not "%DTMS_EXIT_CODE%"=="0" (
  echo.
  echo DTMS startup failed with code %DTMS_EXIT_CODE%.
  pause
  exit /b %DTMS_EXIT_CODE%
)

echo.
echo DTMS containers are running. See the PowerShell output above for URLs.
pause
exit /b 0
