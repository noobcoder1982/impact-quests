const User = require('../models/User');
const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response.util');

/**
 * Auth Controller
 * Handles HTTP layer for authentication operations
 */

/**
 * @route   POST /api/v1/auth/register/volunteer
 * @desc    Register a new volunteer
 * @access  Public
 */
const registerVolunteer = async (req, res, next) => {
  try {
    const result = await authService.registerVolunteer(req.body);

    return successResponse(res, 201, 'Volunteer registered successfully', {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @route   POST /api/v1/auth/register/ngo
 * @desc    Register a new NGO/Admin
 * @access  Public
 */
const registerNGO = async (req, res, next) => {
  try {
    const result = await authService.registerNGO(req.body);

    return successResponse(res, 201, 'NGO registered successfully', {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user (volunteer or NGO)
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);

    return successResponse(res, 200, 'Login successful', {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public (needs valid refresh token)
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return errorResponse(res, 400, 'Refresh token is required');
    }

    const result = await authService.refreshAccessToken(token);

    return successResponse(res, 200, 'Token refreshed successfully', {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshToken -__v');
    return successResponse(res, 200, 'User data retrieved', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/v1/auth/update-ngo
 * @desc    Update NGO profile (self-update only)
 * @access  Private (NGO only)
 */
const updateNGO = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'organizationName', 'bio'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const ngo = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password -refreshToken -__v');

    return successResponse(res, 200, 'NGO Profile updated successfully', { user: ngo });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/v1/auth/update-profile
 * @desc    Update user profile (theme, bio, name)
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'bio', 'theme', 'themeVariant', 'skills', 'availability', 'pfp', 'banner'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password -refreshToken -__v');

    return successResponse(res, 200, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
/**
 * @route   POST /api/v1/auth/onboarding
 * @desc    Complete user onboarding (set skills and nickname)
 * @access  Private
 */
const completeOnboarding = async (req, res, next) => {
  try {
    const { nickname, selectedSkills } = req.body;

    if (!nickname || !selectedSkills || !Array.isArray(selectedSkills)) {
      return errorResponse(res, 400, 'Nickname and selectedSkills are required');
    }

    if (selectedSkills.length > 5) {
      return errorResponse(res, 400, 'You can select up to 5 skills only');
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        nickname,
        selectedSkills,
        skills: selectedSkills, // Also update the main skills field for backward compatibility
        isOnboarded: true,
      },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -__v');

    return successResponse(res, 200, 'Onboarding completed successfully', { user });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 401, 'Current password is incorrect');
    }
    user.password = newPassword;
    await user.save();
    return successResponse(res, 200, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

const admin = require('../config/firebase');

const firebaseLogin = async (req, res, next) => {
  try {
    const { token, role = 'volunteer' } = req.body;
    if (!token) {
      return errorResponse(res, 400, 'Firebase token is required');
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    let user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      user = await User.findOne({ email: decodedToken.email });
      if (user) {
        user.firebaseUid = decodedToken.uid;
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          name: decodedToken.name || decodedToken.email.split('@')[0],
          email: decodedToken.email,
          firebaseUid: decodedToken.uid,
          role: role,
        });
      }
    }

    return successResponse(res, 200, 'Firebase login successful', {
      user,
      accessToken: token, // We use firebase token as our access token
      refreshToken: 'firebase-handles-refresh'
    });
  } catch (error) {
    console.error("Firebase login error:", error);
    return errorResponse(res, 401, 'Invalid Firebase token');
  }
};

/**
 * @route   POST /api/v1/auth/register/customer
 * @desc    Register a new Customer
 * @access  Public
 */
const registerCustomer = async (req, res, next) => {
  try {
    const result = await authService.registerCustomer(req.body);

    return successResponse(res, 201, 'Customer registered successfully', {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.statusCode, error.message);
    }
    next(error);
  }
};

module.exports = {
  registerVolunteer,
  registerNGO,
  registerCustomer,
  login,
  refreshToken,
  getMe,
  updateNGO,
  updateProfile,
  changePassword,
  completeOnboarding,
  firebaseLogin,
};

