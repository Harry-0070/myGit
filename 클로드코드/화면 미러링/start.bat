@echo off
cd /d "%~dp0"

echo Starting server...
echo.

echo Adding firewall rules for ports 3000 and 3443...
netsh advfirewall firewall show rule name="ScreenMonitor-3000" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="ScreenMonitor-3000" dir=in action=allow protocol=TCP localport=3000 >nul 2>&1
    echo [OK] Firewall rule added for port 3000.
) else (
    echo [OK] Firewall rule already exists for port 3000.
)
netsh advfirewall firewall show rule name="ScreenMonitor-3443" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="ScreenMonitor-3443" dir=in action=allow protocol=TCP localport=3443 >nul 2>&1
    echo [OK] Firewall rule added for port 3443.
) else (
    echo [OK] Firewall rule already exists for port 3443.
)
echo.

node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo Running npm install...
    npm install
)

echo Stopping any existing node processes...
taskkill /IM node.exe /F >nul 2>&1
timeout /t 1 /nobreak >nul

echo.
node server.js

echo.
echo Server stopped.
pause
