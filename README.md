# TeraLeads – Take-Home Assignment

Full-stack app: **backend** (Node.js + Express + PostgreSQL) and **frontend** (React + Vite).

---

## Folder structure

```
TeraLeads/
├── .cursor/
│   └── mcp.json          # Supabase MCP (project-scoped, read-only)
├── backend/
│   ├── src/
│   │   ├── routes/       # auth, patients, chat
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── db.js
│   │   └── app.js
│   ├── sql/
│   │   └── schema.sql    # Run in Supabase
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/        # Auth, Dashboard, Chat
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

---

## 1. Database (Supabase)

1. Open your Supabase project → **SQL Editor**.
2. Run the contents of `backend/sql/schema.sql` to create `users`, `patients`, and `chats` tables.

---

## 2. Backend setup

```bash
cd backend
npm install
```

Create `.env` from the example:

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production
SUPABASE_URL=https://gsxlasbzrojihbxgsckd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get **SUPABASE_URL** and **SUPABASE_SERVICE_ROLE_KEY** from Supabase: **Project Settings → API** (Project URL and the `service_role` secret). The backend uses the Supabase JS client over HTTPS, so no direct Postgres connection or IPv4 pooler is needed.

**Run backend:**

```bash
npm run dev
```

Server runs at **http://localhost:3001**.

---

## 3. Frontend setup

The frontend uses **Tailwind CSS** for styling.

```bash
cd frontend
npm install
```

**Run frontend:**

```bash
npm run dev
```

App runs at **http://localhost:5173**. Vite proxies `/api` to `http://localhost:3001`, so the frontend talks to the backend automatically.

---

## 4. Usage

1. Open **http://localhost:5173**.
2. **Register** then **Login** (JWT stored in `localStorage`).
3. **Dashboard**: add/edit/delete patients, pagination.
4. **Chat**: select a patient, view history, send messages (mock AI reply).

---

## API summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register |
| POST | `/auth/login` | No | Login, returns JWT |
| POST | `/patients` | Yes | Create patient |
| GET | `/patients?page=&limit=` | Yes | List patients (paginated) |
| PUT | `/patients/:id` | Yes | Update patient |
| DELETE | `/patients/:id` | Yes | Delete patient |
| GET | `/chat?patientId=` | Yes | Get chat history |
| POST | `/chat` | Yes | Send message, get mock AI reply |

Protected routes use header: `Authorization: Bearer <token>`.

---

## 5. Deploy (optional)

To deploy and share a live link: see **[DEPLOY.md](DEPLOY.md)**. It covers deploying the backend (e.g. Render) and frontend (e.g. Vercel), and setting `VITE_API_URL` and `FRONTEND_URL` so the app works in production.

---

## Supabase MCP (Cursor)

Project includes `.cursor/mcp.json` so Cursor can use Supabase MCP for this project (scoped to `gsxlasbzrojihbxgsckd`, read-only). If Cursor prompts you to sign in to Supabase, complete the browser flow. Then in **Settings → Tools & MCP** you should see Supabase connected. You can ask the AI to query the database or list tables using MCP tools.
