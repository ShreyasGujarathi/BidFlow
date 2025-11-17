# Fix 404 Error: `/_next/static/chunks/app/auth/login/page.js`

## Error Message
```
GET http://localhost:3000/_next/static/chunks/app/auth/login/page.js net::ERR_ABORTED 404 (Not Found)
```

## What This Means

This error occurs when Next.js tries to load a chunk file that doesn't exist. This is typically caused by:

1. **Stale build cache** - The `.next` directory contains outdated build information
2. **Dev server not properly building** - The page hasn't been built yet
3. **File lock issues** - The `.next` directory is locked by another process

## Solution

### Step 1: Stop the Dev Server

1. Press `Ctrl+C` in the terminal where the dev server is running
2. Wait for the process to fully stop
3. If it doesn't stop, close the terminal/IDE

### Step 2: Clear the Cache

**Option A: Using PowerShell Script (Recommended)**
```powershell
.\restart-dev-server.ps1
```

**Option B: Manual Steps**
```powershell
# Stop Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Remove .next directory
Remove-Item -Recurse -Force .next

# Remove node_modules cache
Remove-Item -Recurse -Force node_modules/.cache
```

### Step 3: Restart the Dev Server

```powershell
npm run dev
```

### Step 4: Verify the Fix

1. Wait for the dev server to fully start
2. Navigate to `http://localhost:3000/auth/login`
3. Check the browser console - the 404 error should be gone
4. The page should load correctly

## If the Problem Persists

### Check 1: Verify File Structure
Ensure the file exists at:
```
frontend/src/app/auth/login/page.tsx
```

### Check 2: Check for Syntax Errors
```powershell
npm run lint
```

### Check 3: Check TypeScript Errors
```powershell
npx tsc --noEmit
```

### Check 4: Verify Next.js Installation
```powershell
npm install
```

### Check 5: Clear All Caches
```powershell
# Remove all caches
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules/.cache
Remove-Item -Recurse -Force node_modules/.next

# Reinstall dependencies
npm install

# Restart dev server
npm run dev
```

## Common Causes

1. **File Locked** - Another process is using the `.next` directory
   - Solution: Close all terminals/IDEs and try again

2. **Build Interrupted** - The build was interrupted mid-process
   - Solution: Clear cache and restart

3. **Permission Issues** - Windows file permissions preventing deletion
   - Solution: Run PowerShell as Administrator

4. **Port Already in Use** - Another process is using port 3000
   - Solution: Change port or kill the process using port 3000

## Prevention

1. Always stop the dev server properly (Ctrl+C) before closing
2. Don't manually delete files while the dev server is running
3. Use the restart script for clean restarts
4. Keep Next.js and dependencies updated

## Additional Notes

- The Chrome extension error (`chrome-extension://...`) is unrelated and can be ignored
- This error only affects the login page loading, not the entire application
- Once fixed, the page should work normally

