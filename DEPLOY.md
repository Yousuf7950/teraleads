# Deploying TeraLeads (Backend + Frontend)

Use this guide to deploy the app so you can share a live link. Recommended: **Render** (backend) + **Vercel** (frontend), both have free tiers.

---

## Prerequisites

- Code in a **Git** repo (e.g. GitHub). If not yet:
  ```bash
  cd c:\TeraLeads
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
  git push -u origin main
  ```
- **Supabase** project already set up (tables created, `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` ready).

---

## 1. Deploy backend (Render)

1. Go to [render.com](https://render.com) and sign up / log in.
2. **New** → **Web Service**.
3. Connect your GitHub repo and select the **TeraLeads** repository.
4. Configure:
   - **Name:** e.g. `tera-leads-api`
   - **Root Directory:** leave empty (or set to `backend` if your repo root is one level up; see note below).
   - **Runtime:** Node.
   - **Build Command:** `npm install` (or `cd backend && npm install` if repo root is project root).
   - **Start Command:** `npm start` (or `cd backend && npm start`). Your `package.json` already has `"start": "node src/app.js"`.
   - If your repo root is the **monorepo** (TeraLeads with `backend/` and `frontend/` inside), set **Root Directory** to `backend`. Then build = `npm install`, start = `npm start`.
5. **Environment variables** (Add → key/value):
   - `JWT_SECRET` — pick a long random string (e.g. from `openssl rand -hex 32`).
   - `SUPABASE_URL` — from Supabase → Project Settings → API → Project URL.
   - `SUPABASE_SERVICE_ROLE_KEY` — from Supabase → Project Settings → API → `service_role` (secret).
   - `FRONTEND_URL` — leave empty for now; add after frontend is deployed (e.g. `https://your-app.vercel.app`).
   - Render sets `PORT` automatically; you don’t need to set it.
6. Click **Create Web Service**. Wait for the first deploy to finish.
7. Copy your backend URL, e.g. `https://tera-leads-api.onrender.com`. No trailing slash.
8. (Optional) After frontend is deployed, go back to this service → **Environment** → add or set `FRONTEND_URL` to your Vercel URL → Save. Redeploy if needed.

**Note:** If the repo root is the project root (contains both `backend` and `frontend`), set **Root Directory** to `backend` so Render runs commands inside `backend/`.

---

## 2. Deploy frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign up / log in (e.g. with GitHub).
2. **Add New** → **Project** → import your GitHub repo.
3. Configure:
   - **Root Directory:** leave default, or set to `frontend` if your repo root is the monorepo (TeraLeads with `backend/` and `frontend/`).
   - **Framework Preset:** Vite (should be auto-detected).
   - **Build Command:** `npm run build` (default).
   - **Output Directory:** `dist` (default for Vite).
4. **Environment variables** (Add):
   - **Name:** `VITE_API_URL`
   - **Value:** your backend URL from step 1, e.g. `https://tera-leads-api.onrender.com`. No trailing slash. The frontend will call this URL for all API requests.
5. Click **Deploy**. Wait for the build to finish.
6. Copy your frontend URL, e.g. `https://tera-leads-xxx.vercel.app`.

**If repo root is monorepo:** set **Root Directory** to `frontend` so Vercel builds the React app.

---

## 3. Connect frontend and backend

1. **Backend (Render):** Service → **Environment** → add or edit:
   - `FRONTEND_URL` = your Vercel URL (e.g. `https://tera-leads-xxx.vercel.app`). No trailing slash.
   - Save. Trigger a redeploy if needed so CORS allows this origin.
2. **Frontend:** Already uses `VITE_API_URL` for API calls, so no code change. If you hadn’t set it before, add `VITE_API_URL` and redeploy.

---

## 4. Test the live app

1. Open the **Vercel** (frontend) URL in the browser.
2. Register a new user, then log in.
3. Add a patient on the Dashboard and send a message in Chat. If something fails, check:
   - Browser dev tools → Network: are API requests going to the Render URL and returning 200?
   - Render **Logs**: any errors?
   - CORS: only the exact `FRONTEND_URL` (and no trailing slash mismatch) is allowed.

---

## Free tier notes

- **Render:** Free web services spin down after ~15 min of no traffic; first request after that can take 30–60 seconds to wake up. For a demo, open the backend health URL once to wake it, then use the frontend.
- **Vercel:** Free tier is usually enough for a small demo; no cold starts for the frontend.
- **Supabase:** Free tier is enough for this app.

---

## Quick reference

| Item | Where |
|------|--------|
| Backend URL | Render dashboard → your Web Service → URL |
| Frontend URL | Vercel dashboard → your Project → Domain |
| Backend env | Render → Service → Environment |
| Frontend env | Vercel → Project → Settings → Environment Variables |
| Health check | `GET https://your-backend.onrender.com/health` |

---

## Alternative: Railway (backend)

You can use [Railway](https://railway.app) instead of Render:

1. New Project → Deploy from GitHub → select repo.
2. Set **Root Directory** to `backend` if needed.
3. Add env vars: `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL`.
4. Railway assigns a URL; use that as `VITE_API_URL` in Vercel.

Same idea: backend URL in `VITE_API_URL`, frontend URL in `FRONTEND_URL` for CORS.
