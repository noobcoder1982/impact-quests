const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Auth Service
 * Handles registration, login, and token management
 */

/**
 * Generate JWT access token
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });
};

/**
 * Register a new volunteer
 */
const registerVolunteer = async (userData) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw { statusCode: 400, message: 'Email already registered' };
    }

    // Create volunteer user with production-ready defaults
    const user = await User.create({
      ...userData,
      role: 'volunteer',
      location: userData.location || { type: 'Point', coordinates: [0, 0] },
      // Initialize empty inventory (handled by model defaults)
      energy: 100, // Default energy
      onboarding: {
        completed: false,
        step: 0
      },
      activityPatterns: [], // Empty activity patterns
      reliabilityScore: 100, // Default trust score
      points: 0,
      tasksCompleted: 0,
      level: 1
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Register a new NGO
 */
const registerNGO = async (userData) => {
  try {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw { statusCode: 400, message: 'Email already registered' };
    }

    const user = await User.create({
      ...userData,
      role: 'ngo',
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Login user (volunteer or NGO)
 */
const loginUser = async (email, password) => {
  try {
    // Find user and explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Update refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      throw { statusCode: 401, message: 'Invalid refresh token' };
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Register a new Customer
 */
const registerCustomer = async (userData) => {
  try {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw { statusCode: 400, message: 'Email already registered' };
    }

    const user = await User.create({
      ...userData,
      role: 'customer',
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Remove sensitive fields from user object
 */
const sanitizeUser = (user) => {
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;
  delete userObj.__v;
  return userObj;
};

module.exports = {
  registerVolunteer,
  registerNGO,
  registerCustomer,
  loginUser,
  refreshAccessToken,
};
