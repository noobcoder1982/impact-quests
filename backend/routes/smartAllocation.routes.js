/**
 * Smart Allocation Routes
 * API endpoints for Watson NLU-powered resource allocation
 */

const express = require('express');
const router = express.Router();
const smartAllocationController = require('../controllers/smartAllocation.controller');
const { protect } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/v1/smart-allocation/analyze
 * @desc    Analyze mission description and find best matching volunteers
 * @access  Protected
 * @body    { missionDescription: string, topN?: number }
 */
router.post('/analyze', protect, smartAllocationController.analyzeMission);

/**
 * @route   GET /api/v1/smart-allocation/volunteers
 * @desc    Get list of all available volunteers/resources
 * @access  Protected
 */
router.get('/volunteers', protect, smartAllocationController.getAvailableVolunteers);

/**
 * @route   POST /api/v1/smart-allocation/extract-features
 * @desc    Extract NLU features from mission description (for testing)
 * @access  Protected
 * @body    { missionDescription: string }
 */
router.post('/extract-features', protect, smartAllocationController.extractFeatures);

/**
 * @route   GET /api/v1/smart-allocation/health
 * @desc    Check Watson NLU service health
 * @access  Public
 */
router.get('/health', smartAllocationController.checkHealth);

/**
 * @route   POST /api/v1/smart-allocation/batch-analyze
 * @desc    Analyze multiple missions at once
 * @access  Protected
 * @body    { missions: Array<{id: string, description: string}>, topN?: number }
 */
router.post('/batch-analyze', protect, smartAllocationController.batchAnalyzeMissions);

module.exports = router;

// Made with Bob
