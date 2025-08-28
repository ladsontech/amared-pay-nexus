// Minimal Express auth server (optional) for local testing with JWT + RBAC
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// In-memory users for demo
const users = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', password: 'password', role: 'admin' },
  { id: '2', name: 'Manager User', email: 'manager@example.com', password: 'password', role: 'manager' },
  { id: '3', name: 'Staff User', email: 'staff@example.com', password: 'password', role: 'staff' },
];

app.post('/auth/login/', (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const access = jwt.sign({ sub: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  const refresh = jwt.sign({ sub: user.id, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ access, refresh, email: user.email, username: user.name });
});

app.post('/auth/token/verify/', (req, res) => {
  const { token } = req.body || {};
  try {
    jwt.verify(token, JWT_SECRET);
    return res.json({ valid: true });
  } catch {
    return res.status(401).json({ valid: false });
  }
});

app.post('/auth/token/refresh/', (req, res) => {
  const { refresh } = req.body || {};
  try {
    const payload = jwt.verify(refresh, JWT_SECRET);
    if (payload?.type !== 'refresh') throw new Error('Invalid refresh token');
    const user = users.find(u => u.id === payload.sub);
    if (!user) return res.status(401).json({ message: 'Unknown user' });
    const access = jwt.sign({ sub: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    const newRefresh = jwt.sign({ sub: user.id, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ access, refresh: newRefresh });
  } catch (e) {
    return res.status(401).json({ message: 'Token refresh failed' });
  }
});

app.post('/auth/logout/', (_req, res) => {
  return res.json({ success: true });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Auth server running on http://localhost:${port}`);
});

