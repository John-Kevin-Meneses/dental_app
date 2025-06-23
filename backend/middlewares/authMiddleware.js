const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  
  // 1. Get token from header or cookie
  if (
    req.headers.authorization && 
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // 2. Verify token exists
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Check if user still exists
    const currentUser = await User.findById(req.app.locals.pool, decoded.id);
    if (!currentUser) {
      return res.status(401).json({ 
        success: false, 
        message: 'The user belonging to this token no longer exists' 
      });
    }

    // 5. Grant access
    req.user = {
      id: currentUser.user_id,
      role: currentUser.role,
      email: currentUser.email
    };
    
    next();
  } catch (error) {
    // Handle different JWT errors specifically
    let message = 'Not authorized to access this route';
    if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token';
    } else if (error.name === 'TokenExpiredError') {
      message = 'Token has expired';
    }

    return res.status(401).json({ 
      success: false, 
      message 
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Optional: For sensitive actions like password changes
exports.verifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.app.locals.pool, req.params.id || req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if the requesting user owns the account or is admin
    if (user.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to perform this action' 
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};