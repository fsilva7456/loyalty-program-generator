@echo off
echo[&echo Starting development server...
start cmd /c "npm run dev"
echo[&echo Starting API server...
start cmd /c "npm run api"
echo[&echo Both servers are running. Close this window to stop both servers...
pause