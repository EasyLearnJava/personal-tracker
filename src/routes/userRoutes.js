const express = require('express');
const router = express.Router();
const UserService = require('../services/userService');
const logger = require('../utils/logger');

/**
 * GET /api/users
 * Get all users for task assignment
 */
router.get('/', async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    res.json(users);
  } catch (error) {
    logger.error('Error fetching users', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/users/:id
 * Get a specific user
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    logger.error('Error fetching user', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;

