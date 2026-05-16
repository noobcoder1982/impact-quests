# NGO Project - Multi-Server Launcher
Write-Host "🚀 Launching NGO Full-Stack System..." -ForegroundColor Cyan

# Start Backend
Write-Host "📡 Starting Node.js Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "cd backend; npm run dev"

# Start Frontend
Write-Host "💻 Starting Vite Frontend..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "npm run dev"

Write-Host "✅ Both servers are starting in separate windows!" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000 (check .env for port)" -ForegroundColor Gray
Write-Host "Frontend: Check Vite output for URL" -ForegroundColor Gray
