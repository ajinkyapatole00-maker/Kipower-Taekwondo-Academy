const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../services/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Register Student
router.post('/register-student', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'name, email, password required' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password_hash, role, phone, is_approved) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email',
      [name, email, hashed, 'student', phone, false]
    );

    res.status(201).json({
      success: true,
      message: 'Registration submitted. Await admin approval.',
      user: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// Register Admin (protected)
router.post('/register-admin', authenticate, async (req, res) => {
  try {
    // Only existing admin can create new admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const { name, email, password, phone } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email, password required' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password_hash, role, phone, is_approved) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email',
      [name, email, hashed, 'admin', phone, true]
    );

    res.status(201).json({
      success: true,
      message: 'Admin created',
      user: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email, password required' });
    }

    const userRes = await db.query(
      'SELECT id, name, email, password_hash, role, is_approved FROM users WHERE email = $1',
      [email]
    );

    const user = userRes.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // If student and not approved, deny access
    if (user.role === 'student' && !user.is_approved) {
      return res.status(403).json({
        error: 'Account pending admin approval',
        message: 'Your registration is under review. You will be notified after approval.'
      });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, is_approved: user.is_approved },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
