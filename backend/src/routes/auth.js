const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { 
  authenticateToken, 
  generateTokens, 
  setTokenCookies, 
  clearTokenCookies 
} = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/auth/login
router.post('/login', validate(schemas.login), async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokens = generateTokens(user.id);
    setTokenCookies(res, tokens);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  clearTokenCookies(res);
  res.json({ message: 'Logout successful' });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      fullName: req.user.fullName,
      role: req.user.role
    }
  });
});

// POST /api/auth/refresh (optional - for token refresh)
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const tokens = generateTokens(user.id);
    setTokenCookies(res, tokens);

    res.json({ message: 'Token refreshed' });
  } catch (error) {
    console.error('Token refresh error:', error);
    clearTokenCookies(res);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

module.exports = router;