import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import patientsRoutes from './routes/patients.js';
import chatRoutes from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 3001;

// In production set FRONTEND_URL to your frontend origin (e.g. https://teraleads-pied.vercel.app)
// Strip trailing slash so CORS matches browser Origin header (which never has trailing slash)
const rawOrigin = process.env.FRONTEND_URL?.replace(/\/$/, '') || process.env.FRONTEND_URL;
const corsOrigin = rawOrigin || true;
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/patients', patientsRoutes);
app.use('/chat', chatRoutes);

app.get('/', (req, res) => res.json({ message: 'TeraLeads API', docs: '/health for health check' }));
app.get('/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
