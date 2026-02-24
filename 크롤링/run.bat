@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo [1/2] 패키지 설치 중...
pip install -r requirements.txt
if errorlevel 1 (
    echo.
    echo 패키지 설치 실패. pip install -r requirements.txt 를 수동 실행해 주세요.
    pause
    exit /b 1
)

echo.
echo [2/2] 무신사 랭킹 크롤러 실행...
python musinsa_ranking_gui.py

pause
