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
echo Starting development server...
echo Starting API server...
echo start /B cmd /c "npm run dev"
echo start /B cmd /c "node src/api/index.js"
echo pause
) > start.bat

echo Setup complete!
echo Run start.bat to start the application