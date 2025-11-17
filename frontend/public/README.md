# Public Directory

This directory contains static assets that are served directly by Next.js.

## Files

- `robots.txt` - Search engine crawler instructions
- `manifest.json` - Web app manifest for PWA support
- `.gitkeep` - Ensures this directory is tracked by git

## Adding Favicon

To add a favicon to your application:

1. Create or download a favicon file (`.ico`, `.png`, or `.svg`)
2. Place it in this directory as `favicon.ico`
3. Update `src/app/layout.tsx` to include:
   ```typescript
   icons: {
     icon: '/favicon.ico',
   }
   ```

## Adding Icons

To add app icons:

1. Create icon files (192x192 and 512x512 PNG)
2. Place them in this directory as `icon-192.png` and `icon-512.png`
3. Update `manifest.json` with the correct paths

## Note

- Files in this directory are served from the root URL (`/`)
- Example: `public/favicon.ico` is accessible at `http://localhost:3000/favicon.ico`
- Next.js automatically serves files from this directory

