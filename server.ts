import express from 'express';
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Initialize Supabase client
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xwiwrygpsiqfsfoosagw.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_T4HNsERH2GrP8pogcrcbAg_DP1mzefm';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert into users table
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name: name.trim(),
        role: 'Developer',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      throw error;
    }

    res.status(201).json({
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Registration failed' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    // Query the users table
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      skills: user.skills,
      availability: user.availability,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Login failed' });
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
