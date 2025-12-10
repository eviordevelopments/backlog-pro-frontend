import express from 'express';
import bcrypt from 'bcrypt';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

// POST /api/auth/verify-password
app.post('/api/auth/verify-password', async (req, res) => {
  try {
    const { plainPassword, hash } = req.body;

    if (!plainPassword || !hash) {
      return res.status(400).json({ error: 'Missing password or hash' });
    }

    const valid = await bcrypt.compare(plainPassword, hash);

    res.json({ valid });
  } catch (error) {
    console.error('Password verification error:', error);
    res.status(500).json({ error: 'Password verification failed', valid: false });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});
