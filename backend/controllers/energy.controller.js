const energyService = require('../services/energy.service.js');
const User = require('../models/User.js');
const { successResponse, errorResponse } = require('../utils/response.util.js');

/**
 * Energy Controller
 * Handles energy tracking, feedback submission, and recommendations
 */

/**
 * @route   GET /api/v1/energy
 * @desc    Get current energy status for logged-in user
 * @access  Private
 */
const getEnergyStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Get burnout analysis
    const burnoutAnalysis = await energyService.detectBurnout(userId);

    // Get workload recommendations
    const workloadSuggestions = await energyService.suggestWorkload(userId);

    const response = {
      energy: {
        current: user.energy.current,
        max: user.energy.max,
        lastUpdated: user.energy.lastUpdated,
        history: user.energy.history.slice(-7) // Last 7 entries
      },
      burnout: {
        score: user.burnoutScore,
        risk: burnoutAnalysis.risk,
        factors: burnoutAnalysis.factors
      },
      focus: {
        score: user.focusScore
      },
      workload: {
        capacity: user.workloadCapacity,
        recommended: workloadSuggestions.recommendedTasks,
        restNeeded: workloadSuggestions.restNeeded
      },
      activityPatterns: user.activityPatterns,
      trustScore: user.trustScore,
      recommendations: [
        ...burnoutAnalysis.recommendations,
        ...workloadSuggestions.suggestions
      ]
    };

    return successResponse(res, 200, 'Energy status retrieved successfully', response);
  } catch (error) {
    console.error('Get energy status error:', error);
    return errorResponse(res, error.message || 'Failed to get energy status', 500);
  }
};

/**
 * @route   POST /api/v1/energy/feedback
 * @desc    Submit post-task feedback and update energy
 * @access  Private
 */
const submitFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskId, mentalDrain, focusQuality, capacityForMore, actualDifficulty } = req.body;

    // Validate required fields
    if (!taskId) {
      return errorResponse(res, 400, 'Task ID is required');
    }

    if (!mentalDrain || !focusQuality || !capacityForMore || !actualDifficulty) {
      return errorResponse(res, 400, 'All feedback fields are required');
    }

    // Validate field values
    const validMentalDrain = ['very-low', 'low', 'medium', 'high', 'very-high'];
    const validFocusQuality = [1, 2, 3, 4, 5];
    const validCapacity = ['yes', 'maybe', 'no'];
    const validDifficulty = ['easy', 'medium', 'hard', 'very-hard'];

    if (!validMentalDrain.includes(mentalDrain)) {
      return errorResponse(res, 400, 'Invalid mental drain value');
    }

    if (!validFocusQuality.includes(focusQuality)) {
      return errorResponse(res, 400, 'Invalid focus quality value (must be 1-5)');
    }

    if (!validCapacity.includes(capacityForMore)) {
      return errorResponse(res, 400, 'Invalid capacity value');
    }

    if (!validDifficulty.includes(actualDifficulty)) {
      return errorResponse(res, 400, 'Invalid difficulty value');
    }

    const feedback = {
      mentalDrain,
      focusQuality,
      capacityForMore,
      actualDifficulty
    };

    // Update energy with feedback
    const result = await energyService.updateEnergyAfterTask(userId, taskId, feedback);

    // Prepare response
    const response = {
      energy: result.energy,
      burnout: result.burnout,
      focus: result.focus,
      trust: result.trust,
      recommendations: result.recommendations,
      validation: result.validation
    };

    // Add warning if suspicious activity detected
    if (result.validation.suspicious) {
      response.warning = 'Some feedback patterns were flagged for review. Your trust score may be affected.';
    }

    return successResponse(res, 200, 'Feedback submitted successfully', response);
  } catch (error) {
    console.error('Submit feedback error:', error);
    return errorResponse(res, error.message || 'Failed to submit feedback', 500);
  }
};

/**
 * @route   GET /api/v1/energy/recommendations
 * @desc    Get personalized workload recommendations
 * @access  Private
 */
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get workload suggestions
    const workloadSuggestions = await energyService.suggestWorkload(userId);

    // Get burnout analysis
    const burnoutAnalysis = await energyService.detectBurnout(userId);

    const response = {
      recommendedTasks: workloadSuggestions.recommendedTasks,
      restNeeded: workloadSuggestions.restNeeded,
      suggestions: workloadSuggestions.suggestions,
      burnoutRisk: burnoutAnalysis.risk,
      burnoutFactors: burnoutAnalysis.factors,
      currentMetrics: {
        energy: workloadSuggestions.energyLevel,
        capacity: workloadSuggestions.currentCapacity,
        trustScore: workloadSuggestions.trustScore
      },
      detailedRecommendations: burnoutAnalysis.recommendations
    };

    return successResponse(res, 200, 'Recommendations retrieved successfully', response);
  } catch (error) {
    console.error('Get recommendations error:', error);
    return errorResponse(res, error.message || 'Failed to get recommendations', 500);
  }
};

/**
 * @route   GET /api/v1/energy/history
 * @desc    Get detailed energy history
 * @access  Private
 */
const getEnergyHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 7 } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Get history for specified days
    const historyEntries = Math.min(parseInt(days) * 3, user.energy.history.length);
    const history = user.energy.history.slice(-historyEntries);

    // Calculate statistics
    const energyValues = history.map(h => h.value);
    const avgEnergy = energyValues.reduce((a, b) => a + b, 0) / energyValues.length;
    const minEnergy = Math.min(...energyValues);
    const maxEnergy = Math.max(...energyValues);

    // Detect trends
    const recentAvg = energyValues.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, energyValues.length);
    const olderAvg = energyValues.slice(0, -7).reduce((a, b) => a + b, 0) / Math.max(1, energyValues.length - 7);
    const trend = recentAvg > olderAvg ? 'improving' : recentAvg < olderAvg ? 'declining' : 'stable';

    const response = {
      history,
      statistics: {
        average: Math.round(avgEnergy),
        minimum: minEnergy,
        maximum: maxEnergy,
        current: user.energy.current,
        trend
      },
      burnoutScore: user.burnoutScore,
      focusScore: user.focusScore
    };

    return successResponse(res, 200, 'Energy history retrieved successfully', response);
  } catch (error) {
    console.error('Get energy history error:', error);
    return errorResponse(res, error.message || 'Failed to get energy history', 500);
  }
};

/**
 * @route   POST /api/v1/energy/rest
 * @desc    Mark user as taking rest (increases energy)
 * @access  Private
 */
const takeRest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { hours = 8 } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Calculate energy restoration (10 energy per hour of rest, max 50)
    const energyRestored = Math.min(50, hours * 10);
    
    user.energy.current = Math.min(100, user.energy.current + energyRestored);
    user.energy.lastUpdated = new Date();
    
    // Add to history
    user.energy.history.push({
      value: user.energy.current,
      timestamp: new Date(),
      reason: `Rest period: ${hours} hours (+${energyRestored} energy)`
    });

    if (user.energy.history.length > 30) {
      user.energy.history = user.energy.history.slice(-30);
    }

    // Reduce burnout score
    user.burnoutScore = Math.max(0, user.burnoutScore - 10);

    await user.save();

    const response = {
      energy: {
        current: user.energy.current,
        restored: energyRestored
      },
      burnout: {
        score: user.burnoutScore
      },
      message: `Rest recorded. Energy restored by ${energyRestored} points.`
    };

    return successResponse(res, 200, 'Rest period recorded successfully', response);
  } catch (error) {
    console.error('Take rest error:', error);
    return errorResponse(res, error.message || 'Failed to record rest', 500);
  }
};

module.exports = {
  getEnergyStatus,
  submitFeedback,
  getRecommendations,
  getEnergyHistory,
  takeRest
};

// Made with Bob
