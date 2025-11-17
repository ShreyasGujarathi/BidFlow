# PowerShell script to clear Next.js cache
Write-Host "Stopping any running Next.js processes..." -ForegroundColor Yellow

# Kill any node processes running Next.js
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node*" } | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

Write-Host "Clearing Next.js cache..." -ForegroundColor Yellow

# Remove .next directory
if (Test-Path .next) {
    try {
        Remove-Item -Recurse -Force .next -ErrorAction Stop
        Write-Host "✓ Removed .next directory" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Could not remove .next directory (it may be locked by a running process)" -ForegroundColor Red
        Write-Host "Please stop the dev server and try again" -ForegroundColor Yellow
    }
} else {
    Write-Host "✓ .next directory does not exist" -ForegroundColor Green
}

# Remove node_modules/.cache if it exists
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache" -ErrorAction SilentlyContinue
    Write-Host "✓ Removed node_modules/.cache" -ForegroundColor Green
}

Write-Host "`nCache cleared! You can now start the dev server with: npm run dev" -ForegroundColor Green

