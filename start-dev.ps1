# UBUMWE SACCO - Start Development Servers
# Backend on port 5000, Frontend on port 3000

Write-Host "Starting UBUMWE SACCO Development Environment..." -ForegroundColor Cyan

# Start Backend in a new window
Start-Process powershell -ArgumentList '-NoExit', '-Command', @'
  Set-Location "h:\IT UBUMWE\usgweb-main (1)\webusgbackend"
  Write-Host "Starting Backend API on port 5000..." -ForegroundColor Green
  node src/server.js
'@

Start-Sleep -Seconds 3

# Start Frontend in a new window
Start-Process powershell -ArgumentList '-NoExit', '-Command', @'
  Set-Location "h:\IT UBUMWE\usgweb-main (1)\usgweb-main"
  Write-Host "Starting Frontend on port 3000..." -ForegroundColor Blue
  npm run dev
'@

Write-Host ""
Write-Host "Servers starting in separate windows:" -ForegroundColor Yellow
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Blue
Write-Host ""
Write-Host "Admin login: dmechack12@gmail.com / Kigali@123" -ForegroundColor Cyan
