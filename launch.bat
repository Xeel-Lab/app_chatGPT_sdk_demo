@echo off
cd /d "%~dp0"

start "Frontend (vite)"   cmd /k "cd /d "%~dp0frontend" && pnpm run dev"

cd backend && uvicorn server_python.main:app --host 0.0.0.0 --port 80

echo Avviati backend e frontend in due terminali separati.
