const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/users - List users (admin only)
router.get('/', 
  authenticateToken, 
  requireRole(['admin']), 
  async (req, res) => {
    try {
      const { q, role } = req.query;
      
      const where = {};
      
      if (q) {
        where.OR = [
          { username: { contains: q } },
          { fullName: { contains: q } },
          { phone: { contains: q } }
        ];
      }
      
      if (role) {
        where.role = role;
      }

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          fullName: true,
          phone: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ users });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
);

// POST /api/users - Create user (admin only)
router.post('/', 
  authenticateToken, 
  requireRole(['admin']), 
  validate(schemas.createUser),
  async (req, res) => {
    try {
      const { username, fullName, phone, role, password } = req.body;

      // Check if username already exists
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          username,
          fullName,
          phone,
          role,
          passwordHash
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          phone: true,
          role: true,
          createdAt: true
        }
      });

      res.status(201).json({ 
        message: 'User created successfully',
        user 
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
);

// PATCH /api/users/:id - Update user (admin only)
router.patch('/:id', 
  authenticateToken, 
  requireRole(['admin']), 
  validate(schemas.updateUser),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { fullName, phone, role } = req.body;

      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(fullName !== undefined && { fullName }),
          ...(phone !== undefined && { phone }),
          ...(role !== undefined && { role })
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          phone: true,
          role: true,
          createdAt: true
        }
      });

      res.json({ 
        message: 'User updated successfully',
        user: updatedUser 
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
);

module.exports = router;