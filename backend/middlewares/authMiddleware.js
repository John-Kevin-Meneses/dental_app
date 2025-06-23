const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user to request
 */
exports.protect = async (req, res, next) => {
  let token;
  
  // 1. Get token from various sources
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.signedCookies?.token) {
    token = req.signedCookies.token;
  }

  // 2. Verify token exists
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required: No token provided',
      code: 'NO_TOKEN'
    });
  }

  try {
    // 3. Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      ignoreExpiration: false
    });
    
    // 4. Check if user still exists and token wasn't revoked
    const currentUser = await User.findById(req.app.locals.pool, decoded.id);
    if (!currentUser) {
      return res.status(401).json({ 
        success: false, 
        message: 'User account no longer exists',
        code: 'USER_NOT_FOUND'
      });
    }

    // 5. Check if password was changed after token was issued
    if (currentUser.passwordChangedAt && decoded.iat < currentUser.passwordChangedAt.getTime() / 1000) {
      return res.status(401).json({
        success: false,
        message: 'Password was changed. Please log in again.',
        code: 'PASSWORD_CHANGED'
      });
    }

    // 6. Grant access and attach user to request
    req.user = {
      id: currentUser.user_id,
      role: currentUser.role,
      email: currentUser.email
    };
    
    // Set fresh token in response if about to expire
    if (decoded.exp - Date.now() / 1000 < 1800) { // 30 minutes remaining
      const freshToken = generateToken(currentUser.user_id, currentUser.role);
      res.set('X-Refresh-Token', freshToken);
    }
    
    next();
  } catch (error) {
    // Handle specific JWT errors
    let message = 'Authentication failed';
    let code = 'AUTH_FAILED';
    
    if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token signature';
      code = 'INVALID_TOKEN';
    } else if (error.name === 'TokenExpiredError') {
      message = 'Token has expired';
      code = 'TOKEN_EXPIRED';
    }

    return res.status(401).json({ 
      success: false, 
      message,
      code
    });
  }
};

/**
 * Role-based authorization middleware
 * @param {...string} roles - Allowed roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access forbidden: ${req.user.role} role not permitted`,
        code: 'ROLE_FORBIDDEN'
      });
    }
    next();
  };
};

/**
 * Ownership verification middleware
 * Ensures user owns the resource or has admin privileges
 */
exports.verifyOwnership = async (req, res, next) => {
  try {
    const resourceId = req.params.id || req.body.id;
    if (!resourceId) {
      return res.status(400).json({
        success: false,
        message: 'Resource ID not specified',
        code: 'MISSING_ID'
      });
    }

    // For user-specific resources
    if (resourceId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to modify this resource',
        code: 'OWNERSHIP_REQUIRED'
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during ownership verification',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * Generate JWT token
 * @private
 */
function generateToken(userId, role) {
  return jwt.sign(
    { 
      id: userId,
      role,
      iat: Math.floor(Date.now() / 1000) // issued at
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE || '30d',
      algorithm: 'HS256'
    }
  );
}