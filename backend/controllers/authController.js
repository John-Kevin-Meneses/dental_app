const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Patient = require('../models/Patient');

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

  const client = await req.app.locals.pool.connect();
  
  try {
    const { username, email, password, first_name, last_name, phone } = req.body;
    const role = 'patient'; // Force patient role for registrations

    await client.query('BEGIN');

    // Check existing user
    if (await User.findByEmail(client, email)) {
      return res.status(409).json({
        success: false,
        error: 'Email already in use'
      });
    }

    if (await User.findByUsername(client, username)) {
      return res.status(409).json({
        success: false,
        error: 'Username already in use'
      });
    }

    // Create user account
    const user = await User.create(client, { 
      username, 
      email, 
      password, 
      role 
    });

    // Create patient record
    const patient = await Patient.create(client, {
      user_id: user.user_id,
      first_name,
      last_name,
      phone
    });

    await client.query('COMMIT');

    // Generate token
    const token = generateToken(user.user_id, user.role);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        ...sanitizeUser(user),
        patient: {
          first_name: patient.first_name,
          last_name: patient.last_name,
          phone: patient.phone
        }
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  } finally {
    client.release();
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

    // Get patient data if role is patient
    let patientData = null;
    if (user.role === 'patient') {
      const patient = await Patient.findByUserId(req.app.locals.pool, user.user_id);
      if (patient) {
        patientData = {
          first_name: patient.first_name,
          last_name: patient.last_name,
          phone: patient.phone
        };
      }
    }

    const token = generateToken(user.user_id, user.role);
    
    res.json({
      success: true,
      token,
      user: {
        ...sanitizeUser(user),
        ...(patientData && { patient: patientData })
      }
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

    // Get patient data if role is patient
    let patientData = null;
    if (user.role === 'patient') {
      const patient = await Patient.findByUserId(req.app.locals.pool, user.user_id);
      if (patient) {
        patientData = {
          first_name: patient.first_name,
          last_name: patient.last_name,
          phone: patient.phone
        };
      }
    }

    res.json({
      success: true,
      user: {
        ...sanitizeUser(user),
        ...(patientData && { patient: patientData })
      }
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

// Password reset handler remains the same
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(req.app.locals.pool, email);
    
    if (user) {
      const resetToken = generateToken(user.user_id, user.role);
      // In production: Send email with reset token
      // Save token to DB with expiration
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      error: 'Password reset failed'
    });
  }
};