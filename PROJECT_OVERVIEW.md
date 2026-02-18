# TeraLeads – Project Overview

Use this document to explain the project in an interview, to a teammate, or in a README.

---

## What is it?

**TeraLeads** is a full-stack take-home assignment: a small web app for managing **patients** and having a **chat** with a mock AI per patient. Users register and log in, then use a dashboard to add/edit/delete patients and a chat page to send messages and see a fixed AI reply.

---

## Purpose

- Demonstrate **full-stack** skills: backend API + React frontend.
- Keep scope suitable for a **3–5 hour** take-home (no over-engineering).
- Use a **simple, clear** structure: routes → controllers → services, with a real DB (Supabase/PostgreSQL).

---

## Tech stack

| Layer      | Technology |
|-----------|------------|
| **Backend** | Node.js, Express, **Supabase** (PostgreSQL + JS client), JWT auth, bcrypt |
| **Frontend** | React (Vite), React Router, Axios, **Tailwind CSS v4** |
| **Database** | PostgreSQL via **Supabase** (hosted); tables created with provided SQL |
| **Auth** | Custom (not Supabase Auth): register/login, JWT in `Authorization` header, token stored in `localStorage` |

The backend uses the **Supabase JavaScript client** (not a direct Postgres connection), so it works over HTTPS and avoids IPv4/DNS issues with Supabase’s direct DB host.

---

## High-level architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser (http://localhost:5173)                                 │
│  React SPA – Auth page, Dashboard, Chat page                     │
│  Axios calls to /api/* → Vite proxy → Backend                    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend (http://localhost:3001)                                │
│  Express: /auth, /patients, /chat                                │
│  JWT middleware on /patients and /chat                            │
│  Controllers → Services → Supabase client                        │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Supabase (PostgreSQL + REST API)                                 │
│  Tables: users, patients, chats                                  │
│  Backend uses SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY            │
└─────────────────────────────────────────────────────────────────┘
```

- **Frontend**: Single-page app; no auth = redirect to login; with auth = Dashboard and Chat with shared layout (header + nav).
- **Backend**: REST API; auth routes public, patients and chat protected by JWT. Services contain all DB logic via Supabase client.
- **Database**: One schema (e.g. `public`). Users own patients; patients own chat messages. All identified by `user_id` (and `patient_id` for chats).

---

## Features (what the app does)

1. **Auth**
   - **Register**: email, password, optional name → user created, then switch to login.
   - **Login**: email + password → returns JWT; frontend stores it in `localStorage` and sends it as `Authorization: Bearer <token>`.
   - Passwords are hashed with **bcrypt**. JWT is signed with **JWT_SECRET** (env).

2. **Patients (Dashboard)**
   - **List** patients for the logged-in user, with **pagination** (`page`, `limit`).
   - **Add** patient: name (required), email, phone, DOB, medical notes.
   - **Edit** and **Delete** existing patients.
   - Table view with actions; add/edit in a modal.

3. **Chat**
   - **Select a patient** from a dropdown (same user’s patients).
   - **Load chat history** for that patient (user + assistant messages).
   - **Send message**: body `{ patientId, message }` → backend saves user message, then a **mock AI reply** (e.g. “Please consult your dentist for proper diagnosis.”), saves it, returns the AI reply. No real AI/LLM.
   - UI: message bubbles (user right, assistant left), input + Send, loading state while sending.

4. **Error handling**
   - Backend: try/catch in controllers, proper HTTP status codes (400, 401, 404, 409, 500). In dev, 500 can include a `detail` message.
   - Frontend: shows API error messages (e.g. under form or in alert area).

---

## Data model (database)

- **users**  
  `id`, `email` (unique), `password_hash`, `name`, `created_at`  
  Used for login and to scope patients/chats.

- **patients**  
  `id`, `user_id` (FK → users), `name`, `email`, `phone`, `dob`, `medical_notes`, `created_at`, `updated_at`  
  Each patient belongs to one user.

- **chats**  
  `id`, `user_id` (FK → users), `patient_id` (FK → patients), `role` (‘user’ | ‘assistant’), `content`, `created_at`  
  Conversation is per user and per patient.

Indexes on `patients(user_id)` and `chats(user_id, patient_id)` for faster queries. Schema is in `backend/sql/schema.sql` (run once in Supabase SQL Editor).

---

## API (summary)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register (email, password, optional name) |
| POST | `/auth/login` | No | Login → `{ token, user }` |
| POST | `/patients` | JWT | Create patient |
| GET | `/patients?page=&limit=` | JWT | List patients (paginated) |
| PUT | `/patients/:id` | JWT | Update patient |
| DELETE | `/patients/:id` | JWT | Delete patient |
| GET | `/chat?patientId=` | JWT | Get chat history for patient |
| POST | `/chat` | JWT | Send message; body `{ patientId, message }`; returns AI reply object |
| GET | `/health` | No | Health check `{ ok: true }` |

Protected routes require header: `Authorization: Bearer <token>`.

---

## Backend structure

```
backend/
├── src/
│   ├── app.js              # Express app, CORS, JSON, route mounting
│   ├── db.js               # Supabase client (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
│   ├── routes/             # auth.js, patients.js, chat.js
│   ├── controllers/        # authController, patientsController, chatController
│   ├── services/           # authService, patientsService, chatService
│   └── middleware/
│       └── auth.js         # JWT verification; sets req.userId
├── sql/
│   └── schema.sql          # DDL for users, patients, chats
├── .env.example
└── package.json
```

- **Routes** define HTTP methods and paths and call **controllers**.
- **Controllers** validate input, call **services**, and send responses (status + JSON).
- **Services** contain all Supabase (DB) logic; no HTTP here.
- **Middleware** runs on `/patients` and `/chat` to ensure a valid JWT and set `req.userId`.

---

## Frontend structure

```
frontend/
├── src/
│   ├── main.jsx            # React root, BrowserRouter, imports index.css
│   ├── App.jsx             # Routes: / (Auth), /dashboard, /chat; Protected/Public wrappers
│   ├── index.css            # @import "tailwindcss" (Tailwind v4)
│   ├── api.js               # Axios instance: baseURL /api, injects Bearer token, 401 → logout
│   ├── components/
│   │   └── Layout.jsx       # Header (TeraLeads, Dashboard/Chat nav, Logout), wraps Dashboard & Chat
│   └── pages/
│       ├── AuthPage.jsx     # Login/Register form, toggles mode
│       ├── Dashboard.jsx   # Patient table, pagination, add/edit modal, delete
│       └── ChatPage.jsx     # Patient select, message list, input + send
├── index.html
├── vite.config.js           # React plugin + @tailwindcss/vite; proxy /api → backend
└── package.json
```

- **Auth**: If no token, only `/` is allowed; if token, `/` redirects to `/dashboard`.
- **api.js**: All API calls go through this; token from `localStorage` is attached; on 401, token is cleared and user is sent to `/`.

---

## How to run it (short version)

1. **Database**  
   Supabase project → SQL Editor → run `backend/sql/schema.sql`.

2. **Backend**  
   - `cd backend` → `npm install`  
   - Copy `.env.example` to `.env`, set `PORT`, `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`  
   - `npm run dev` → http://localhost:3001  

3. **Frontend**  
   - `cd frontend` → `npm install`  
   - `npm run dev` → http://localhost:5173  

4. **Use the app**  
   Open http://localhost:5173 → Register → Login → Dashboard (patients) and Chat.

---

## Design decisions (for discussion)

- **Supabase client instead of raw `pg`**: Avoids direct Postgres connection (e.g. IPv4/DNS issues with Supabase’s DB host). All DB access over HTTPS via Supabase API.
- **Custom auth instead of Supabase Auth**: Keeps the assignment self-contained (JWT + bcrypt, no Supabase Auth setup).
- **Mock AI**: Chat returns a fixed reply to show the flow (save user message → generate reply → save and return). Easy to replace with a real AI later.
- **JWT in `localStorage`**: Simple for a take-home; for production you might consider httpOnly cookies and refresh tokens.
- **Tailwind v4 with Vite plugin**: No separate PostCSS Tailwind config; single `@import "tailwindcss"` and `@tailwindcss/vite` in Vite.

---

## Extras

- **Supabase MCP**: `.cursor/mcp.json` configures Supabase MCP for this project (read-only, project-scoped) so Cursor can query the DB via MCP tools.
- **Health check**: `GET /health` for uptime/load balancer checks.

---

## One-paragraph pitch (elevator summary)

“TeraLeads is a full-stack take-home app: React (Vite + Tailwind) frontend and Node/Express backend, with auth (JWT + bcrypt), patient CRUD with pagination, and a per-patient chat that uses a mock AI reply. The backend uses the Supabase JS client to talk to PostgreSQL, so there’s no direct DB connection. I can walk through the API, the data model, and how auth and the chat flow work end to end.”

You can copy any section from this file into a README or use it as talking points when explaining the project.
