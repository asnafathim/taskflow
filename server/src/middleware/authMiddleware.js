const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getDBStatus } = require('../config/db');
const { getDevUserById } = require('../controllers/authController');

/**
 * Middleware to verify JWT authentication token
 * Attaches authenticated user document to req.user
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in to access this resource.'
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret_dev_key';
    const decoded = jwt.verify(token, jwtSecret);

    let user = null;
    if (getDBStatus()) {
      user = await User.findById(decoded.id).select('-password').lean();
    } else {
      user = getDevUserById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Verification error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.'
    });
  }
};

module.exports = { protect };
