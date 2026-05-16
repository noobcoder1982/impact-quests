# ============================================================================
# ImpactQuest Development Environment Launcher
# ============================================================================

# Configuration
$config = @{
    backendPath = "c:\Users\DELL\Desktop\hackathon files\Google-hackathon-files\backend"
    frontendPath = "c:\Users\DELL\Desktop\hackathon files\Google-hackathon-files"
    backendPort = 5000
    frontendPort = 5173
    backendWindowTitle = "ImpactQuest - BACKEND API"
    frontendWindowTitle = "ImpactQuest - FRONTEND"
}

# Color definitions
$c_cyan = [char]27 + "[38;5;81m"
$c_purple = [char]27 + "[38;5;141m"
$c_green = [char]27 + "[38;5;121m"
$c_yellow = [char]27 + "[38;5;228m"
$c_gray = [char]27 + "[38;5;242m"
$c_red = [char]27 + "[38;5;196m"
$c_blue = [char]27 + "[38;5;33m"
$c_reset = [char]27 + "[0m"

# Process tracking
$global:processes = @{
    backend = $null
}

# ============================================================================
# Helper Functions
# ============================================================================

function Write-Banner {
    Write-Host "`n$c_cyan === IMPACTQUEST MISSION CONTROL === $c_reset`n"
}

function Show-Status {
    param([string]$task, [string]$color = $c_cyan)
    Write-Host ("   " + $c_gray + "[*] " + $task + "...") -NoNewline
    Start-Sleep -Milliseconds 200
    Write-Host ("`r   " + $c_gray + "[OK] " + $task + "... " + $color + "[DONE]" + $c_reset)
}

function Show-Error { param([string]$message) Write-Host ("   " + $c_red + "[ERROR] " + $message + $c_reset) }

function Start-BackendServer {
    Show-Status "Starting Backend" $c_purple
    if (-not (Test-Path $config.backendPath)) { Show-Error "Backend path missing"; return $false }
    
    try {
        $backend_cmd = "cd '$($config.backendPath)'; `$host.ui.RawUI.WindowTitle = '$($config.backendWindowTitle)'; npm run dev"
        $global:processes.backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "`"$backend_cmd`"" -PassThru
        return $true
    } catch { Show-Error "Failed to start backend"; return $false }
}

function Start-FrontendServer {
    Show-Status "Starting Frontend" $c_cyan
    if (-not (Test-Path $config.frontendPath)) { Show-Error "Frontend path missing"; return $false }
    Set-Location $config.frontendPath
    npm run dev
}

function stop-all {
    if ($global:processes.backend -and -not $global:processes.backend.HasExited) {
        Stop-Process -InputObject $global:processes.backend -Force
        Write-Host "Backend Stopped." -ForegroundColor Yellow
    }
}

function up {
    Clear-Host
    Write-Banner
    if (Start-BackendServer) {
        Write-Host ("`n" + $c_green + ">>> LAUNCHING INTERFACE..." + $c_reset)
        Start-FrontendServer
    }
}

function help {
    Write-Host "`nCommands: up, stop-all, help" -ForegroundColor Cyan
}

# Load message
Write-Host ($c_green + ">>> Mission Control Ready. Type 'up' to launch." + $c_reset)
