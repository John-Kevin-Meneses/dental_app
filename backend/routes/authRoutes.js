// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Register route
router.post('/register', [
  check('first_name', 'First name is required').notEmpty(),
  check('last_name', 'Last name is required').notEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be 6+ characters').isLength({ min: 6 }),
  check('phone', 'Phone number is required').notEmpty()
], authController.register);

// Login route
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], authController.login);

// Get current user route (protected)
router.get('/me', authMiddleware.protect, authController.getMe);

module.exports = router; // This exports the router as a middleware function