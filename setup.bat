@echo off
setlocal EnableDelayedExpansion

echo Starting setup...

REM Check if .env file exists
if not exist .env (
    echo Creating .env file...
    set /p OPENAI_KEY=Enter your OpenAI API key: 
    echo VITE_OPENAI_API_KEY=!OPENAI_KEY!> .env
    echo Created .env file
)

REM Install dependencies
echo Installing dependencies...
call npm install
echo Dependencies installed

REM Create start script
echo Creating start script...
(
echo @echo off
echo[^&echo Starting development server...
start cmd /c "npm run dev"
echo[^&echo Starting API server...
start cmd /c "npm run api"
echo[^&echo Both servers are running. Close this window to stop both servers...
echo pause
) > start.bat

echo Setup complete!
echo Run start.bat to start the application