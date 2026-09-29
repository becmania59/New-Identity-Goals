# Become — Identity Program PWA

A small offline-first progressive web app for a phased identity-based habit program.

## What it includes
- Four 3-week phases: Recalibrate → Build → Expand → Embody
- Five daily identity anchors per phase
- Automatic phase ascension after 21 days (toggleable)
- Daily evidence notes
- 7-day consistency and “days won” metrics
- Sunday identity review
- Editable identity statement, career goal, phase names, standards and duration
- Local-only storage in the browser
- JSON data export
- Offline support through a service worker

## Run locally
A PWA service worker requires localhost or HTTPS. From this folder, run:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080` in Chrome, Edge or Safari.

## Install on a phone
Host the folder on any HTTPS host (GitHub Pages, Netlify, Cloudflare Pages, Vercel, etc.). Open the hosted URL on your phone and use the browser's “Add to Home Screen” / install option.

## Privacy
No account or server is used. Data is stored in `localStorage` on the device/browser where you use the app. Export a backup before clearing browser data or moving devices.
