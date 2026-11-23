@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Khong tim thay Node.js. Cai Node.js phien ban 18 tro len roi chay lai.
  pause
  exit /b 1
)
echo DTMS Frontend se chay tai http://127.0.0.1:4173
node scripts\serve.cjs 4173
pause
