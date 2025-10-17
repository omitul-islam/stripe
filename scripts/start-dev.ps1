# Industry-standard PowerShell startup script for Windows
# Runs backend and frontend concurrently with proper process management

$ErrorActionPreference = "Stop"

# Colors
function Write-Info { Write-Host "[INFO] $args" -ForegroundColor Blue }
function Write-Success { Write-Host "[SUCCESS] $args" -ForegroundColor Green }
function Write-Warning { Write-Host "[WARNING] $args" -ForegroundColor Yellow }
function Write-ErrorMsg { Write-Host "[ERROR] $args" -ForegroundColor Red }

# Project paths
$RootDir = Split-Path -Parent $PSScriptRoot
$LogDir = Join-Path $RootDir "logs"
$BackendDir = Join-Path $RootDir "backend"
$FrontendDir = Join-Path $RootDir "frontend"

# Process objects
$BackendProcess = $null
$FrontendProcess = $null

# Cleanup function
function Stop-Services {
    Write-Warning "Shutting down services..."
    
    if ($BackendProcess -and !$BackendProcess.HasExited) {
        Write-Info "Stopping backend (PID: $($BackendProcess.Id))..."
        Stop-Process -Id $BackendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    
    if ($FrontendProcess -and !$FrontendProcess.HasExited) {
        Write-Info "Stopping frontend (PID: $($FrontendProcess.Id))..."
        Stop-Process -Id $FrontendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    
    Write-Success "All services stopped"
}

# Register cleanup on exit
Register-EngineEvent PowerShell.Exiting -Action { Stop-Services }

# Create logs directory
if (!(Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir | Out-Null
}

# Check directories
if (!(Test-Path $BackendDir)) {
    Write-ErrorMsg "Backend directory not found: $BackendDir"
    exit 1
}

if (!(Test-Path $FrontendDir)) {
    Write-ErrorMsg "Frontend directory not found: $FrontendDir"
    exit 1
}

# Check dependencies
Write-Info "Checking dependencies..."

if (!(Test-Path "$BackendDir\node_modules")) {
    Write-Warning "Backend dependencies not found. Running npm install..."
    Push-Location $BackendDir
    npm install
    Pop-Location
}

if (!(Test-Path "$FrontendDir\node_modules")) {
    Write-Warning "Frontend dependencies not found. Running npm install..."
    Push-Location $FrontendDir
    npm install
    Pop-Location
}

# Check environment file
if (!(Test-Path "$BackendDir\.env")) {
    Write-ErrorMsg "Backend .env file not found!"
    Write-Info "Please copy .env.example to .env and configure it"
    exit 1
}

try {
    # Start backend
    Write-Info "Starting backend server..."
    Push-Location $BackendDir
    $BackendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" `
        -RedirectStandardOutput "$LogDir\backend.log" `
        -RedirectStandardError "$LogDir\backend-error.log" `
        -PassThru -NoNewWindow
    Pop-Location
    Write-Success "Backend started (PID: $($BackendProcess.Id))"
    Write-Info "Backend logs: $LogDir\backend.log"

    # Wait for backend to initialize
    Start-Sleep -Seconds 3

    # Check if backend is still running
    if ($BackendProcess.HasExited) {
        Write-ErrorMsg "Backend failed to start. Check logs at $LogDir\backend-error.log"
        exit 1
    }

    # Start frontend
    Write-Info "Starting frontend server..."
    Push-Location $FrontendDir
    $FrontendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" `
        -RedirectStandardOutput "$LogDir\frontend.log" `
        -RedirectStandardError "$LogDir\frontend-error.log" `
        -PassThru -NoNewWindow
    Pop-Location
    Write-Success "Frontend started (PID: $($FrontendProcess.Id))"
    Write-Info "Frontend logs: $LogDir\frontend.log"

    # Wait for frontend to initialize
    Start-Sleep -Seconds 3

    # Check if frontend is still running
    if ($FrontendProcess.HasExited) {
        Write-ErrorMsg "Frontend failed to start. Check logs at $LogDir\frontend-error.log"
        Stop-Services
        exit 1
    }

    # Display service URLs
    Write-Success "✨ Development environment started successfully!"
    Write-Host ""
    Write-Info "Services running:"
    Write-Info "  → Backend:  http://localhost:5000"
    Write-Info "  → Frontend: http://localhost:3000"
    Write-Host ""
    Write-Info "Logs:"
    Write-Info "  → Backend:  Get-Content $LogDir\backend.log -Wait"
    Write-Info "  → Frontend: Get-Content $LogDir\frontend.log -Wait"
    Write-Host ""
    Write-Warning "Press Ctrl+C to stop all services"

    # Monitor processes
    while ($true) {
        if ($BackendProcess.HasExited) {
            Write-ErrorMsg "Backend process died unexpectedly!"
            Stop-Services
            exit 1
        }
        
        if ($FrontendProcess.HasExited) {
            Write-ErrorMsg "Frontend process died unexpectedly!"
            Stop-Services
            exit 1
        }
        
        Start-Sleep -Seconds 5
    }
}
catch {
    Write-ErrorMsg "An error occurred: $_"
    Stop-Services
    exit 1
}
finally {
    Stop-Services
}
