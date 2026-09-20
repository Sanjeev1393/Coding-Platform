---
title: "INC-001: Hardcoded Production URL"
description: "All production API calls failed because localhost was hardcoded in the frontend."
---

# INC-001 — Production API URL Hardcoded

**Date:** 2026-09
**Severity:** High (production submissions completely broken)

---

## Symptom

All code submissions and question loads failed silently after the first production deployment. The UI showed loading spinners that never resolved.

---

## Root Cause

The frontend was calling `http://localhost:8080` in production.

The API base URL was hardcoded in the frontend service layer:

```js
// Before fix
const API_BASE_URL = 'http://localhost:8080';
```

In local development this works. In production (Vercel), `localhost:8080` refers to the user's browser machine — where the backend does not exist.

---

## Investigation

1. Opened browser DevTools → Network tab
2. Noticed all API requests were going to `localhost:8080` instead of the Render backend URL
3. Requests were failing with `net::ERR_CONNECTION_REFUSED`
4. Traced the URL to a hardcoded constant in the API service file

---

## Fix

Replace hardcode with an environment variable, read at Vite build time:

```js
// After fix
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
```

Set `VITE_API_BASE_URL=https://your-backend.onrender.com` in Vercel project settings.

**Why `import.meta.env`?** Vite inlines environment variables prefixed with `VITE_` at build time. The built JS bundle contains the literal URL string. This is intentional — it means the variable must be set in the deployment platform's dashboard, not in a `.env` file that gets bundled.

---

## Lesson

**Never hardcode environment-specific values.** Any URL, API key, or configuration that differs between environments must be externalised via environment variables.

This is especially easy to miss in frontend code because:
- Frontend runs in the browser, not a server
- There's no runtime `.env` loading (unlike Node.js)
- Vite bakes env vars in at build time — wrong values mean a new build is required

---

## Prevention

- `VITE_API_BASE_URL` is documented in `.env.example`
- Added a `apiConfig.test.js` that verifies the URL is not `localhost` when `NODE_ENV=production`
- Pre-deploy checklist includes: verify `VITE_API_BASE_URL` is set in Vercel dashboard

---

## Interview Topics

- Deployment
- Environment variables
- Frontend/backend separation
- How Vite handles environment variables
- Production debugging with browser DevTools
- Why you don't commit `.env` files
