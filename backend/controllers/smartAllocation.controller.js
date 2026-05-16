/**
 * Smart Allocation Controller
 * Handles HTTP requests for smart resource allocation using Watson NLU
 */

const smartAllocationService = require('../services/smartAllocation.service');
const { successResponse, errorResponse } = require('../utils/response.util');

/**
 * POST /api/v1/smart-allocation/analyze
 * Analyze mission description and find best matching volunteers
 * 
 * Request body:
 * {
 *   "missionDescription": "Medical supplies and boats needed for 50 stranded families in the flooded downtown area",
 *   "topN": 3  // Optional, defaults to 3
 * }
 */
async function analyzeMission(req, res) {
  try {
    const { missionDescription, topN } = req.body;

    // Validate request
    if (!missionDescription) {
      return errorResponse(res, 'Mission description is required', 400);
    }

    if (typeof missionDescription !== 'string') {
      return errorResponse(res, 'Mission description must be a string', 400);
    }

    if (missionDescription.trim().length < 10) {
      return errorResponse(res, 'Mission description is too short. Please provide at least 10 characters.', 400);
    }

    // Validate topN if provided
    const limit = topN ? parseInt(topN) : 3;
    if (isNaN(limit) || limit < 1 || limit > 10) {
      return errorResponse(res, 'topN must be a number between 1 and 10', 400);
    }

    console.log(`📋 Analyzing mission: "${missionDescription.substring(0, 50)}..."`);

    // Call the service to find best matches
    const result = await smartAllocationService.findBestMatches(missionDescription, limit);

    return successResponse(res, 200, 'Mission analyzed successfully', result);

  } catch (error) {
    console.error('❌ Error in analyzeMission controller:', error);

    // Handle specific error types
    if (error.message.includes('authentication') || error.message.includes('API key')) {
      return errorResponse(res, 500, 'Watson NLU service authentication failed. Please contact administrator.');
    }

    if (error.message.includes('network') || error.message.includes('connect')) {
      return errorResponse(res, 503, 'Cannot connect to Watson NLU service. Please try again later.');
    }

    return errorResponse(res, 500, error.message || 'Failed to analyze mission');
  }
}

/**
 * GET /api/v1/smart-allocation/volunteers
 * Get list of all available volunteers/resources
 */
async function getAvailableVolunteers(req, res) {
  try {
    const volunteers = smartAllocationService.mockVolunteers;

    return successResponse(res, 200, 'Volunteers retrieved successfully', {
      volunteers,
      total: volunteers.length,
      available: volunteers.filter(v => v.availability === 'available').length
    });

  } catch (error) {
    console.error('❌ Error in getAvailableVolunteers controller:', error);
    return errorResponse(res, 500, error.message || 'Failed to retrieve volunteers');
  }
}

/**
 * POST /api/v1/smart-allocation/extract-features
 * Extract NLU features from mission description (for testing/debugging)
 * 
 * Request body:
 * {
 *   "missionDescription": "Medical supplies needed urgently"
 * }
 */
async function extractFeatures(req, res) {
  try {
    const { missionDescription } = req.body;

    // Validate request
    if (!missionDescription) {
      return errorResponse(res, 'Mission description is required', 400);
    }

    if (typeof missionDescription !== 'string') {
      return errorResponse(res, 'Mission description must be a string', 400);
    }

    console.log(`🔍 Extracting features from: "${missionDescription.substring(0, 50)}..."`);

    // Extract features using Watson NLU
    const features = await smartAllocationService.extractMissionFeatures(missionDescription);

    return successResponse(res, 200, 'Features extracted successfully', features);

  } catch (error) {
    console.error('❌ Error in extractFeatures controller:', error);

    if (error.message.includes('authentication') || error.message.includes('API key')) {
      return errorResponse(res, 500, 'Watson NLU service authentication failed. Please contact administrator.');
    }

    return errorResponse(res, 500, error.message || 'Failed to extract features');
  }
}

/**
 * GET /api/v1/smart-allocation/health
 * Check Watson NLU service health
 */
async function checkHealth(req, res) {
  try {
    const healthStatus = await smartAllocationService.checkWatsonHealth();

    if (healthStatus.status === 'healthy') {
      return successResponse(res, 200, 'Service is healthy', healthStatus);
    } else {
      return errorResponse(res, 503, healthStatus.message);
    }

  } catch (error) {
    console.error('❌ Error in checkHealth controller:', error);
    return errorResponse(res, 500, 'Health check failed');
  }
}

/**
 * POST /api/v1/smart-allocation/batch-analyze
 * Analyze multiple missions at once
 * 
 * Request body:
 * {
 *   "missions": [
 *     { "id": "m1", "description": "Medical supplies needed" },
 *     { "id": "m2", "description": "Boat rescue required" }
 *   ],
 *   "topN": 3
 * }
 */
async function batchAnalyzeMissions(req, res) {
  try {
    const { missions, topN } = req.body;

    // Validate request
    if (!missions || !Array.isArray(missions)) {
      return errorResponse(res, 'Missions must be an array', 400);
    }

    if (missions.length === 0) {
      return errorResponse(res, 'At least one mission is required', 400);
    }

    if (missions.length > 5) {
      return errorResponse(res, 'Maximum 5 missions can be analyzed at once', 400);
    }

    const limit = topN ? parseInt(topN) : 3;

    console.log(`📋 Batch analyzing ${missions.length} missions...`);

    // Analyze each mission
    const results = await Promise.all(
      missions.map(async (mission) => {
        try {
          if (!mission.description) {
            return {
              id: mission.id,
              success: false,
              error: 'Mission description is required'
            };
          }

          const result = await smartAllocationService.findBestMatches(mission.description, limit);
          return {
            id: mission.id,
            success: true,
            ...result
          };
        } catch (error) {
          return {
            id: mission.id,
            success: false,
            error: error.message
          };
        }
      })
    );

    const successCount = results.filter(r => r.success).length;

    return successResponse(res, 200, `Batch analysis complete: ${successCount}/${missions.length} successful`, {
      results,
      summary: {
        total: missions.length,
        successful: successCount,
        failed: missions.length - successCount
      }
    });

  } catch (error) {
    console.error('❌ Error in batchAnalyzeMissions controller:', error);
    return errorResponse(res, 500, error.message || 'Failed to batch analyze missions');
  }
}

module.exports = {
  analyzeMission,
  getAvailableVolunteers,
  extractFeatures,
  checkHealth,
  batchAnalyzeMissions
};

// Made with Bob
