@echo off
setlocal enabledelayedexpansion

REM Inventory Management System - Windows Setup Script

echo 🚀 Inventory Management System - Windows Setup
echo ==============================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js v16 or higher.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1,2,3 delims=." %%a in ('node --version') do set NODE_VERSION=%%a
set NODE_VERSION=%NODE_VERSION:~1%
if %NODE_VERSION% LSS 16 (
    echo [ERROR] Node.js version 16 or higher is required. Current version: 
    node --version
    pause
    exit /b 1
)
echo [SUCCESS] Node.js is installed

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed
    pause
    exit /b 1
)
echo [SUCCESS] npm is installed

REM Check if Docker is available
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Docker is available
    set DOCKER_AVAILABLE=true
) else (
    echo [WARNING] Docker not found. Will use manual setup.
    set DOCKER_AVAILABLE=false
)

REM Check if ports are available
netstat -an | find "3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo [ERROR] Port 3000 is already in use
    pause
    exit /b 1
)

netstat -an | find "8000" >nul 2>&1
if %errorlevel% equ 0 (
    echo [ERROR] Port 8000 is already in use
    pause
    exit /b 1
)

echo [SUCCESS] Required ports are available

REM Create .env file if it doesn't exist
if not exist "backend\.env" (
    echo [INFO] Creating backend environment file...
    (
        echo # Server Configuration
        echo PORT=8000
        echo NODE_ENV=development
        echo.
        echo # MongoDB Configuration
        echo MONGODB_URI=mongodb://localhost:27017/inventory_management
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=inventory-management-system-jwt-secret-key-2024
        echo JWT_EXPIRE=7d
        echo.
        echo # Redis Configuration
        echo REDIS_URL=redis://localhost:6379
        echo.
        echo # RabbitMQ Configuration
        echo RABBITMQ_URL=amqp://localhost:5672
        echo.
        echo # Rate Limiting
        echo RATE_LIMIT_WINDOW_MS=900000
        echo RATE_LIMIT_MAX_REQUESTS=100
    ) > backend\.env
    echo [SUCCESS] Backend environment file created
) else (
    echo [WARNING] Backend environment file already exists
)

REM Install dependencies
echo [INFO] Installing backend dependencies...
cd backend
call npm install
cd ..

echo [INFO] Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo [SUCCESS] Dependencies installed successfully

REM Setup database
echo [INFO] Setting up database...
cd backend
if exist "scripts\setup-database.js" (
    node scripts\setup-database.js
    echo [SUCCESS] Database setup completed
) else (
    echo [WARNING] Database setup script not found. Please run manually.
)
cd ..

REM Start services
if "%DOCKER_AVAILABLE%"=="true" (
    echo [INFO] Starting services with Docker...
    docker-compose up -d
    echo [SUCCESS] All services started with Docker
) else (
    echo [INFO] Please start the following services manually:
    echo 1. MongoDB: Start MongoDB service
    echo 2. Redis: Start Redis service
    echo 3. RabbitMQ: Start RabbitMQ service
    echo.
    echo Then run:
    echo cd backend ^&^& npm run dev
    echo cd frontend ^&^& npm start
)

echo.
echo [SUCCESS] Setup completed successfully!
echo.
echo 🎉 Your Inventory Management System is ready!
echo.
echo 📱 Access the application:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000
echo.
echo 👤 Default login credentials:
echo    Admin: admin@example.com / admin123
echo    User: user@example.com / user123
echo.
echo 📚 For more information, see SETUP.md
echo.
pause 