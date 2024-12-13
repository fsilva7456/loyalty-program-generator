@echo off

echo Starting Loyalty Program Generator...

:: Start Frontend (Vite)
start "Frontend - Vite" cmd /k "npm run dev"

:: Wait 2 seconds to ensure frontend starts first
timeout /t 2 /nobreak > nul

:: Start Backend (Express)
start "Backend - Express" cmd /k "npm run server"

echo Started both servers successfully!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:3001