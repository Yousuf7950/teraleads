# Deploying TeraLeads (Backend + Frontend)

Use this guide to deploy the app so you can share a live link. Recommended: **Render** (backend) + **Vercel** (frontend).

**Note:** Render’s free tier may ask for credit card verification. If it doesn’t accept your card or you prefer not to add one, use one of the **backend alternatives below** (Railway, Koyeb, or Fly.io)—they don’t require a card for their free tiers.

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

1. Go to [render.com](https://render.com) and sign up / log in (e.g. with GitHub). Complete account setup if it asks for card details for the free tier.
2. **New +** → **Web Service**.
3. Connect your GitHub account if needed, then select the **TeraLeads** repository.
4. Configure the service:
   - **Name:** e.g. `tera-leads-api`
   - **Region:** choose one close to you
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** If your repo has both `backend` and `frontend` at the root, set this to **`backend`**. If your repo root is only the backend, leave it empty.
   - **Runtime:** **Node**
   - **Build Command:** `npm install` (Render runs this from the root directory you set, so from `backend/` if Root Directory is `backend`)
   - **Start Command:** `npm start` (your `package.json` has `"start": "node src/app.js"`)
5. **Environment variables:** Click **Add Environment Variable** and add:
   - **Key:** `JWT_SECRET` → **Value:** a long random string (e.g. run `openssl rand -hex 32` in a terminal, or use a password generator)
   - **Key:** `SUPABASE_URL` → **Value:** from Supabase → Project Settings → API → **Project URL**
   - **Key:** `SUPABASE_SERVICE_ROLE_KEY` → **Value:** from Supabase → Project Settings → API → **service_role** (secret key)
   - **Key:** `FRONTEND_URL` → **Value:** leave empty for now; you’ll set it after deploying the frontend (e.g. `https://your-app.vercel.app`)
   - Render sets `PORT` automatically; do **not** add it.
6. Click **Create Web Service**. Wait for the first deploy to finish (build + start).
7. Copy your backend URL from the top of the service page, e.g. `https://tera-leads-api.onrender.com`. Use it **without** a trailing slash.
8. After the frontend is deployed, go back to this service → **Environment** → edit `FRONTEND_URL` and set it to your Vercel URL (no trailing slash) → **Save Changes**. Redeploy if needed so CORS allows your frontend.

**If your repo root has only the backend** (no `frontend` folder), leave **Root Directory** empty. Build and start commands stay `npm install` and `npm start`.

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

1. **Backend (Render):** Open your Web Service → **Environment** → add or edit:
   - `FRONTEND_URL` = your Vercel URL (e.g. `https://tera-leads-xxx.vercel.app`). No trailing slash.
   - Click **Save Changes**. Optionally trigger a **Manual Deploy** so CORS picks up the new origin.
2. **Frontend:** Already uses `VITE_API_URL` for API calls. If you didn’t set it in step 2, add `VITE_API_URL` in Vercel and redeploy.

---

## 4. Test the live app

1. Open the **Vercel** (frontend) URL in the browser.
2. Register a new user, then log in.
3. Add a patient on the Dashboard and send a message in Chat. If something fails, check:
   - Browser dev tools → Network: are API requests going to the Render URL and returning 200?
   - Render **Logs**: any errors?
   - CORS: only the exact `FRONTEND_URL` (no trailing slash mismatch) is allowed.

---

## Free tier notes

- **Render:** Free web services **spin down after ~15 minutes** of no traffic. The first request after that can take 30–60 seconds to wake the service. For a demo, open `https://your-app.onrender.com/health` in a tab first to wake it, then use the frontend. Render may require card verification for the free tier (no charge for free usage).
- **Vercel:** Free tier is usually enough for a small demo; no cold starts for the frontend.
- **Supabase:** Free tier is enough for this app.

---

## Quick reference

| Item | Where |
|------|--------|
| Backend URL | Render dashboard → your Web Service → URL (e.g. `https://tera-leads-api.onrender.com`) |
| Frontend URL | Vercel dashboard → your Project → Domain |
| Backend env | Render → Web Service → Environment |
| Frontend env | Vercel → Project → Settings → Environment Variables |
| Health check | `GET https://your-app.onrender.com/health` |

---

## Backend alternatives (no card required)

If Render won’t accept your card or you don’t want to add one, use one of these. Same env vars everywhere: `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL`. After deploy, use the backend URL as **`VITE_API_URL`** in Vercel and your Vercel URL as **`FRONTEND_URL`** on the backend.

### Option A: Railway

- **Free:** $5 one-time credit (no card), then $1/month free credit. Enough for a small Node app.
- [railway.app](https://railway.app) → Sign up with GitHub (no card).

1. **New Project** → **Deploy from GitHub** → select your TeraLeads repo.
2. Railway may deploy the whole repo. If you have both `backend` and `frontend`, add a **Service** and set **Root Directory** to `backend` (or in Settings → set the service source to the `backend` folder).
3. **Variables** tab → add `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL` (add `FRONTEND_URL` after the frontend is live).
4. **Settings** → **Networking** → **Generate Domain** to get a public URL (e.g. `https://xxx.up.railway.app`).
5. Use that URL as `VITE_API_URL` in Vercel; set `FRONTEND_URL` on Railway to your Vercel URL.

### Option B: Koyeb

- **Free:** 2 services free, no credit card required.
- [koyeb.com](https://www.koyeb.com) → Sign up (e.g. GitHub).

1. **Create App** → **GitHub** → select your repo.
2. **Service** settings: set **Root directory** to `backend` if your repo has both backend and frontend.
3. **Build**: Builder = Dockerfile or Nixpacks; if no Dockerfile, Nixpacks will detect Node and run `npm install` + `npm start` from the root (or `backend/` if you set root directory).
4. **Environment**: Add `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL`.
5. Deploy; Koyeb assigns a URL. Use it as `VITE_API_URL` in Vercel and set `FRONTEND_URL` on Koyeb to your Vercel URL.

### Option C: Fly.io

- **Free:** Small VMs free per month; no card required for the free allowance (card can be added later for paid).
- [fly.io](https://fly.io) → Sign up; install [flyctl](https://fly.io/docs/hands-on/install-flyctl/) and run `fly auth signup` or `fly auth login`.

1. From your project root: `cd backend` then `fly launch` (no Dockerfile: choose “Nixpacks” or add a minimal Dockerfile). Or create a `Dockerfile` in `backend/`:  
   `FROM node:20-alpine` → `WORKDIR /app` → `COPY . .` → `RUN npm install --production` → `CMD ["npm","start"]` → then `fly launch` in `backend/`.
2. **fly secrets set** `JWT_SECRET=...` **SUPABASE_URL=...** **SUPABASE_SERVICE_ROLE_KEY=...** **FRONTEND_URL=...** (set `FRONTEND_URL` after frontend is deployed).
3. **fly deploy**. Your app URL will be like `https://your-app-name.fly.dev`.
4. Use that URL as `VITE_API_URL` in Vercel; set `FRONTEND_URL` in Fly secrets to your Vercel URL.

---

**Summary:** Railway and Koyeb are the quickest (connect repo, set root dir + env, get URL). Fly.io is a bit more CLI-based but also free and no card needed. All three work with the same frontend on Vercel and env var pattern.
