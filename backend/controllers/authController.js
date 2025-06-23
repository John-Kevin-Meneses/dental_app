const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Token generation helper
const generateToken = (userId, role) => jwt.sign(
  { id: userId, role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRE || '30d' }
);

// Remove sensitive data from user object
const sanitizeUser = (user) => {
  const { password_hash, ...userData } = user;
  return userData;
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  try {
    const { first_name, last_name, email, password, phone, role = 'patient' } = req.body;

    // Check existing user
    if (await User.findByEmail(req.app.locals.pool, email)) {
      return res.status(409).json({
        success: false,
        error: 'Email already in use'
      });
    }

    // Create and save user
    const user = await User.create(req.app.locals.pool, {
      first_name,
      last_name,
      email,
      password,
      phone,
      role
    });

    // Generate token and respond
    const token = generateToken(user.user_id, user.role);
    
    res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(user)
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(req.app.locals.pool, email);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const token = generateToken(user.user_id, user.role);
    
    res.json({
      success: true,
      token,
      user: sanitizeUser(user)
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.app.locals.pool, req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    res.json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

// Optional: Password reset handler
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(req.app.locals.pool, email);
    
    if (user) {
      // In production: Send reset email with token
      const resetToken = generateToken(user.user_id, user.role);
      // Save token to DB with expiration
    }
    
    // Always return success to prevent email enumeration
    res.json({ success: true });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      error: 'Password reset failed'
    });
  }
};