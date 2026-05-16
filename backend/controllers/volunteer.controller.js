const User = require('../models/User');
const gamificationService = require('../services/gamification.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response.util');

/**
 * Volunteer Controller
 * Handles volunteer-specific operations
 */

/**
 * @route   GET /api/v1/volunteers
 * @desc    Get all volunteers (with pagination)
 * @access  Private
 */
const getVolunteers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      skill,
      sortBy = 'points',
      order = 'desc',
    } = req.query;

    const filter = { role: 'volunteer' };
    if (skill) {
      filter.skills = { $in: [skill] };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [volunteers, total] = await Promise.all([
      User.find(filter)
        .select('-password -refreshToken -__v')
        .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    return paginatedResponse(res, volunteers, parseInt(page), parseInt(limit), total);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/volunteers/:id
 * @desc    Get a single volunteer by ID
 * @access  Private
 */
const getVolunteer = async (req, res, next) => {
  try {
    const volunteer = await User.findOne({
      _id: req.params.id,
      role: 'volunteer',
    }).select('-password -refreshToken -__v');

    if (!volunteer) {
      return errorResponse(res, 404, 'Volunteer not found');
    }

    return successResponse(res, 200, 'Volunteer retrieved', { volunteer });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/v1/volunteers/update
 * @desc    Update volunteer profile (self-update only)
 * @access  Private (Volunteer only)
 */
const updateVolunteer = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'skills', 'location', 'availability'];
    const updates = {};

    // Only allow updating specific fields
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle location formatting
    if (updates.location && updates.location.coordinates) {
      updates.location = {
        type: 'Point',
        coordinates: updates.location.coordinates,
      };
    }

    const volunteer = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password -refreshToken -__v');

    return successResponse(res, 200, 'Profile updated successfully', { volunteer });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/volunteers/leaderboard
 * @desc    Get the volunteer leaderboard
 * @access  Private
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await gamificationService.getLeaderboard(limit);

    return successResponse(res, 200, 'Leaderboard retrieved', { leaderboard });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/volunteers/:id/badges
 * @desc    Get a volunteer's badges
 * @access  Private
 */
const getVolunteerBadges = async (req, res, next) => {
  try {
    const volunteer = await User.findOne({
      _id: req.params.id,
      role: 'volunteer',
    }).select('name badges points level');

    if (!volunteer) {
      return errorResponse(res, 404, 'Volunteer not found');
    }

    return successResponse(res, 200, 'Badges retrieved', {
      name: volunteer.name,
      level: volunteer.level,
      points: volunteer.points,
      badges: volunteer.badges,
      totalBadges: volunteer.badges.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVolunteers,
  getVolunteer,
  updateVolunteer,
  getLeaderboard,
  getVolunteerBadges,
};
