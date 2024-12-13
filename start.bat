@echo off

REM Start Vite development server in a new window
start "Vite Dev Server" cmd /k "npm run dev"

REM Start API server in a new window with full output
start "API Server" cmd /k "node src/api/index.js"

echo Both servers are starting in separate windows.
echo Close this window when you're done.
pause