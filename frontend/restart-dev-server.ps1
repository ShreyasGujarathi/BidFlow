# PowerShell script to properly restart the Next.js dev server
Write-Host "Restarting Next.js Dev Server" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Step 1: Stop any running Node processes
Write-Host "`n[1/4] Stopping Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✓ Stopped Node processes" -ForegroundColor Green

# Step 2: Clear Next.js cache
Write-Host "`n[2/4] Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path .next) {
    try {
        Remove-Item -Recurse -Force .next -ErrorAction Stop
        Write-Host "✓ Removed .next directory" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Could not remove .next directory (it may be locked)" -ForegroundColor Red
        Write-Host "  Please close the terminal/IDE and try again" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✓ .next directory does not exist" -ForegroundColor Green
}

# Step 3: Clear node_modules cache
Write-Host "`n[3/4] Clearing node_modules cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache" -ErrorAction SilentlyContinue
    Write-Host "✓ Removed node_modules/.cache" -ForegroundColor Green
} else {
    Write-Host "✓ node_modules/.cache does not exist" -ForegroundColor Green
}

# Step 4: Start dev server
Write-Host "`n[4/4] Starting dev server..." -ForegroundColor Yellow
Write-Host "`nStarting: npm run dev" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
npm run dev

