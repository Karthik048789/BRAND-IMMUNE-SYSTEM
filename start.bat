@echo off
echo ========================================================
echo   Starting BRAND IMMUNE SYSTEM - Full Stack App
echo ========================================================
echo.
echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "BIS-Backend" cmd /k "python run_backend.py"

echo Starting Vite Frontend on http://localhost:5173 ...
cd frontend
start "BIS-Frontend" cmd /k "npm run dev"

echo.
echo Applications started!
echo Open http://localhost:5173 in your browser to access the dashboard.
echo ========================================================
pause
