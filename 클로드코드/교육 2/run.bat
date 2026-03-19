@echo off
chcp 65001 > nul
title 손글씨 텍스트 인식기

echo =========================================
echo   손글씨 텍스트 인식기 (Claude Vision)
echo =========================================
echo.

:: Check Python
python --version > nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python이 설치되지 않았거나 PATH에 없습니다.
    echo https://www.python.org 에서 설치하세요.
    pause
    exit /b 1
)

:: Install dependencies
echo 의존성 확인 중...
pip show flask > nul 2>&1
if errorlevel 1 (
    echo Flask 설치 중...
    pip install flask > nul 2>&1
)
pip show easyocr > nul 2>&1
if errorlevel 1 (
    echo EasyOCR 설치 중... (시간이 걸릴 수 있습니다)
    pip install easyocr > nul 2>&1
)
pip show pillow > nul 2>&1
if errorlevel 1 (
    echo Pillow 설치 중...
    pip install pillow > nul 2>&1
)
pip show numpy > nul 2>&1
if errorlevel 1 (
    echo NumPy 설치 중...
    pip install numpy > nul 2>&1
)
echo 의존성 OK.
echo.

:: Open browser after 2 seconds
start /b cmd /c "timeout /t 2 > nul && start http://localhost:5000"

echo 서버 시작 중: http://localhost:5000
echo 종료하려면 Ctrl+C 를 누르세요.
echo.

:: Run app
python app.py

pause
