@echo off
cd /d "%~dp0"

echo [CHECK] Current directory: %CD%
echo.
echo [CHECK] Node.js:
node --version
echo.
echo [CHECK] npm:
npm --version
echo.
echo [CHECK] server.js exists:
if exist "server.js" (echo YES) else (echo NO - MISSING!)
echo.
echo [CHECK] node_modules exists:
if exist "node_modules\" (echo YES) else (echo NO - need npm install)
echo.
echo [CHECK] Port 3000 usage:
netstat -ano | findstr ":3000"
echo.
pause
