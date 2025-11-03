const express = require('express');
const router = express.Router();
const AuthService = require('../services/authService');
const Logger = require('../utils/logger');

// Register endpoint
router.post('/register', async (req, res) => {
  const startTime = Date.now();
  try {
    const { email, password, fullName } = req.body;

    Logger.debug('Register endpoint called', { email, fullName });

    // Validation
    if (!email || !password) {
      Logger.warn('Register validation failed - missing email or password', { email });
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    if (password.length < 6) {
      Logger.warn('Register validation failed - password too short', { email });
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    const result = await AuthService.register(email, password, fullName);

    if (!result.success) {
      Logger.logRequest('POST', '/api/auth/register', 400, Date.now() - startTime);
      return res.status(400).json(result);
    }

    Logger.logRequest('POST', '/api/auth/register', 201, Date.now() - startTime);
    res.status(201).json(result);
  } catch (error) {
    Logger.logException(error, 'Register endpoint');
    Logger.logRequest('POST', '/api/auth/register', 500, Date.now() - startTime);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const startTime = Date.now();
  try {
    const { email, password } = req.body;

    Logger.debug('Login endpoint called', { email });

    // Validation
    if (!email || !password) {
      Logger.warn('Login validation failed - missing email or password', { email });
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const result = await AuthService.login(email, password);

    if (!result.success) {
      Logger.logRequest('POST', '/api/auth/login', 401, Date.now() - startTime);
      return res.status(401).json(result);
    }

    Logger.logRequest('POST', '/api/auth/login', 200, Date.now() - startTime);
    res.json(result);
  } catch (error) {
    Logger.logException(error, 'Login endpoint');
    Logger.logRequest('POST', '/api/auth/login', 500, Date.now() - startTime);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  const startTime = Date.now();
  try {
    Logger.debug('Logout endpoint called');
    const result = await AuthService.logout();

    if (!result.success) {
      Logger.logRequest('POST', '/api/auth/logout', 400, Date.now() - startTime);
      return res.status(400).json(result);
    }

    Logger.logRequest('POST', '/api/auth/logout', 200, Date.now() - startTime);
    res.json(result);
  } catch (error) {
    Logger.logException(error, 'Logout endpoint');
    Logger.logRequest('POST', '/api/auth/logout', 500, Date.now() - startTime);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get current user endpoint
router.get('/me', async (req, res) => {
  const startTime = Date.now();
  try {
    Logger.debug('Get current user endpoint called');
    const result = await AuthService.getCurrentUser();

    if (!result.success) {
      Logger.logRequest('GET', '/api/auth/me', 401, Date.now() - startTime);
      return res.status(401).json(result);
    }

    Logger.logRequest('GET', '/api/auth/me', 200, Date.now() - startTime);
    res.json(result);
  } catch (error) {
    Logger.logException(error, 'Get current user endpoint');
    Logger.logRequest('GET', '/api/auth/me', 500, Date.now() - startTime);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Verify token endpoint
router.post('/verify', async (req, res) => {
  const startTime = Date.now();
  try {
    const { token } = req.body;

    Logger.debug('Verify token endpoint called');

    if (!token) {
      Logger.warn('Verify token validation failed - token missing');
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }

    const result = await AuthService.verifyToken(token);

    if (!result.success) {
      Logger.logRequest('POST', '/api/auth/verify', 401, Date.now() - startTime);
      return res.status(401).json(result);
    }

    Logger.logRequest('POST', '/api/auth/verify', 200, Date.now() - startTime);
    res.json(result);
  } catch (error) {
    Logger.logException(error, 'Verify token endpoint');
    Logger.logRequest('POST', '/api/auth/verify', 500, Date.now() - startTime);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update profile endpoint
router.put('/profile', async (req, res) => {
  const startTime = Date.now();
  try {
    const { userId, updates } = req.body;

    Logger.debug('Update profile endpoint called', { userId });

    if (!userId) {
      Logger.warn('Update profile validation failed - userId missing');
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const result = await AuthService.updateProfile(userId, updates);

    if (!result.success) {
      Logger.logRequest('PUT', '/api/auth/profile', 400, Date.now() - startTime);
      return res.status(400).json(result);
    }

    Logger.logRequest('PUT', '/api/auth/profile', 200, Date.now() - startTime);
    res.json(result);
  } catch (error) {
    Logger.logException(error, 'Update profile endpoint');
    Logger.logRequest('PUT', '/api/auth/profile', 500, Date.now() - startTime);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

