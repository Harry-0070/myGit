@echo off
chcp 65001 > nul
title Digit Recognizer

echo =========================================
echo   Handwritten Digit Recognizer
echo =========================================
echo.

:: Check Python installation
python --version > nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python from https://www.python.org
    pause
    exit /b 1
)

:: Install required packages if missing
echo Checking dependencies...
pip show flask > nul 2>&1
if errorlevel 1 (
    echo Installing Flask...
    pip install flask > nul 2>&1
)
pip show numpy > nul 2>&1
if errorlevel 1 (
    echo Installing NumPy...
    pip install numpy > nul 2>&1
)
pip show pillow > nul 2>&1
if errorlevel 1 (
    echo Installing Pillow...
    pip install pillow > nul 2>&1
)
pip show scikit-learn > nul 2>&1
if errorlevel 1 (
    echo Installing scikit-learn...
    pip install scikit-learn > nul 2>&1
)
echo Dependencies OK.
echo.

:: Open browser after 3 seconds (runs in background)
start /b cmd /c "timeout /t 3 > nul && start http://localhost:5000"

echo Starting server at http://localhost:5000
echo Press Ctrl+C to stop.
echo.

:: Run Flask app
python app.py

pause
