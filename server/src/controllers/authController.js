const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getDBStatus } = require('../config/db');

// In-memory development users store (fallback when MongoDB is not connected)
const devUsers = [];

const getDevUserById = (id) => {
  const user = devUsers.find((u) => u._id.toString() === id.toString());
  if (!user) return null;
  return {
    _id: user._id,
    name: user.name,
    email: user.email
  };
};

/**
 * Generate JWT Token helper
 */
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'default_jwt_secret_dev_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

/**
 * @desc   Register a new user
 * @route  POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate inputs
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required.'
      });
    }

    if (name.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot exceed 50 characters.'
      });
    }

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim().toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check for existing user in MongoDB Atlas if connected
    if (getDBStatus()) {
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.'
        });
      }

      // Create user (password is hashed automatically by User model pre-save hook)
      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password
      });

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    }

    // In-memory dev fallback when MongoDB is offline
    const devUserExists = devUsers.find((u) => u.email === cleanEmail);
    if (devUserExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(password, salt);
    const fakeId = new mongoose.Types.ObjectId().toString();

    const newDevUser = {
      _id: fakeId,
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    devUsers.push(newDevUser);

    const token = generateToken(fakeId);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: fakeId,
        name: newDevUser.name,
        email: newDevUser.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Authenticate user & get token (Login)
 * @route  POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Database lookup
    if (getDBStatus()) {
      const user = await User.findOne({ email: cleanEmail }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        message: 'Logged in successfully!',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    }

    // In-memory dev fallback lookup
    const devUser = devUsers.find((u) => u.email === cleanEmail);
    if (!devUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isDevMatch = await bcrypt.compare(password, devUser.password);
    if (!isDevMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(devUser._id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: devUser._id,
        name: devUser.name,
        email: devUser.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get current authenticated user's profile
 * @route  GET /api/auth/me
 */
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  });
};

module.exports = {
  register,
  login,
  getMe,
  getDevUserById
};
