@echo off
echo ========================================
echo USDC Payment System - Setup Script
echo ========================================
echo.

REM Check Node.js installation
echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js is installed
echo.

REM Check PostgreSQL installation
echo [2/6] Checking PostgreSQL installation...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: PostgreSQL not found in PATH
    echo Please install PostgreSQL or run it via Docker
    echo See DATABASE_RABBITMQ_SETUP.md for instructions
) else (
    echo PostgreSQL is installed
)
echo.

REM Backend setup
echo [3/6] Setting up backend...
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install backend dependencies
        cd ..
        pause
        exit /b 1
    )
) else (
    echo Backend dependencies already installed
)
cd ..
echo.

REM Frontend setup
echo [4/6] Setting up frontend...
cd frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install frontend dependencies
        cd ..
        pause
        exit /b 1
    )
) else (
    echo Frontend dependencies already installed
)
cd ..
echo.

REM Environment files check
echo [5/6] Checking environment files...
if not exist backend\.env (
    echo WARNING: backend\.env not found
    echo Please copy backend\.env.example to backend\.env and configure it
)
if not exist frontend\.env (
    echo WARNING: frontend\.env not found  
    echo Please copy frontend\.env.example to frontend\.env and configure it
)
echo.

REM Database setup
echo [6/6] Database setup...
echo.
echo To set up the database, run:
echo   psql -U postgres -d stripe_payments -f backend\src\database\schema.sql
echo.
echo Or use Docker:
echo   docker run --name stripe-postgres -e POSTGRES_PASSWORD=your_password -e POSTGRES_DB=stripe_payments -p 5432:5432 -d postgres:14
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Configure backend\.env with your Stripe keys, database URL, and email settings
echo 2. Configure frontend\.env with your Stripe publishable key
echo 3. Set up PostgreSQL database (see DATABASE_RABBITMQ_SETUP.md)
echo 4. Set up RabbitMQ (see DATABASE_RABBITMQ_SETUP.md)
echo 5. Run: npm run dev (in backend directory)
echo 6. Run: npm run worker (in backend directory, separate terminal)
echo 7. Run: npm run dev (in frontend directory, separate terminal)
echo.
echo For detailed instructions, see:
echo - README.md
echo - SETUP_GUIDE.md
echo - DATABASE_RABBITMQ_SETUP.md
echo.
pause
