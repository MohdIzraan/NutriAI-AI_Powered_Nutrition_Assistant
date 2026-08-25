const User = require('../models/User');
const Profile = require('../models/Profile');
const { generateToken } = require('../middleware/auth.middleware');
const {
  sendSuccess,
  sendCreated,
  sendError,
  sendConflict,
  sendUnauthorized,
} = require('../utils/response.utils');
const logger = require('../utils/logger');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendConflict(res, 'An account with this email already exists');
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    // Create empty profile
    await Profile.create({ user: user._id });

    // Generate token
    const token = generateToken(user._id);

    logger.info(`New user registered: ${user.email}`);

    return sendCreated(
      res,
      {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isProfileComplete: user.isProfileComplete,
          createdAt: user.createdAt,
        },
      },
      'Account created successfully'
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return sendUnauthorized(res, 'Invalid email or password');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendUnauthorized(res, 'Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    logger.info(`User logged in: ${user.email}`);

    return sendSuccess(
      res,
      {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isProfileComplete: user.isProfileComplete,
          lastLogin: user.lastLogin,
        },
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendUnauthorized(res, 'User not found');
    }

    return sendSuccess(res, { user }, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  // Client-side logout - just acknowledge
  // Token invalidation would require a blacklist 
  return sendSuccess(res, {}, 'Logged out successfully');
};

module.exports = { register, login, getMe, logout };
