@echo off
echo Starting ChatApp...
echo.
echo Installing frontend dependencies...
cd /d "d:\real\New folder\CascadeProjects\web-chatting-app"
call npm install
echo.
echo Installing backend dependencies...
cd /d "d:\real\New folder\CascadeProjects\web-chatting-app\server"
call npm install
echo.
echo Starting backend server...
start "Backend Server" cmd /k "cd /d \"d:\real\New folder\CascadeProjects\web-chatting-app\server\" && npm start"
echo.
echo Starting frontend development server...
cd /d "d:\real\New folder\CascadeProjects\web-chatting-app"
start "Frontend Server" cmd /k "npm run dev"
echo.
echo ChatApp is starting...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
pause
