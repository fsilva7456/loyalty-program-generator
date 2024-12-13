@echo off
echo Setting up Loyalty Program Generator...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed. Please install Node.js and try again.
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
call npm install

REM Create .env file
echo Please enter your OpenAI API key:
set /p OPENAI_API_KEY=
echo OPENAI_API_KEY=%OPENAI_API_KEY% > .env

REM Create start script
echo Creating start script...
(
    echo @echo off
    echo echo Starting Loyalty Program Generator...
    echo start "Frontend - Vite" cmd /c "npm run dev"
    echo timeout /t 2
    echo start "Backend - Express" cmd /c "npm run server"
) > start.bat

echo Setup complete! Run start.bat to launch the application.