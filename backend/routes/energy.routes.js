const express = require('express');
const router = express.Router();
const energyController = require('../controllers/energy.controller.js');
const { protect } = require('../middleware/auth.middleware.js');

/**
 * Energy Routes
 * All routes require authentication
 */

// @route   GET /api/v1/energy
// @desc    Get current energy status
// @access  Private
router.get('/', protect, energyController.getEnergyStatus);

// @route   POST /api/v1/energy/feedback
// @desc    Submit post-task feedback
// @access  Private
router.post('/feedback', protect, energyController.submitFeedback);

// @route   GET /api/v1/energy/recommendations
// @desc    Get personalized workload recommendations
// @access  Private
router.get('/recommendations', protect, energyController.getRecommendations);

// @route   GET /api/v1/energy/history
// @desc    Get detailed energy history
// @access  Private
router.get('/history', protect, energyController.getEnergyHistory);

// @route   POST /api/v1/energy/rest
// @desc    Record rest period
// @access  Private
router.post('/rest', protect, energyController.takeRest);

module.exports = router;

// Made with Bob
