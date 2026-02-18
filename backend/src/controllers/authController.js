import * as authService from '../services/authService.js';

export async function register(req, res) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const user = await authService.register(email, password, name);
    res.status(201).json(user);
  } catch (err) {
    console.error('Register error:', err.message, err.code);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const message = process.env.NODE_ENV === 'production' ? 'Registration failed' : err.message;
    res.status(500).json({ error: 'Registration failed', detail: message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const result = await authService.login(email, password);
    if (!result) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json(result);
  } catch (err) {
    console.error('Login error:', err.message, err.code);
    const message = process.env.NODE_ENV === 'production' ? undefined : err.message;
    res.status(500).json({ error: 'Login failed', detail: message });
  }
}
