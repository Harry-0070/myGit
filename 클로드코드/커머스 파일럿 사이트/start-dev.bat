@echo off
echo ================================================
echo  FABRIC Commerce - 개발 서버 시작
echo ================================================

echo [1/3] Docker Compose로 PostgreSQL + Redis 시작...
docker compose up -d
if %errorlevel% neq 0 (
  echo ERROR: Docker가 실행 중이 아닙니다.
  echo Docker Desktop을 설치하고 실행한 후 다시 시도하세요.
  echo https://www.docker.com/products/docker-desktop
  pause
  exit /b 1
)

echo [2/3] 5초 대기 (DB 초기화)...
timeout /t 5 /nobreak > nul

echo [3/3] DB 마이그레이션 실행...
cd apps\backend
call pnpm db:migrate
cd ..\..

echo ================================================
echo  서버 시작 완료!
echo  다음 명령어로 개발 서버를 실행하세요:
echo
echo  터미널 1: cd apps\backend ^&^& pnpm dev
echo  터미널 2: cd apps\storefront ^&^& pnpm dev
echo
echo  접속 URL:
echo  - 스토어프론트: http://localhost:8000
echo  - Medusa Admin: http://localhost:9000/app
echo ================================================
pause
