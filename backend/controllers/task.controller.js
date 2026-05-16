const taskService = require('../services/task.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response.util');

/**
 * Task Controller
 * Handles HTTP layer for task operations
 */

/**
 * @route   POST /api/v1/tasks
 * @desc    Create a new task
 * @access  Private (NGO only)
 */
const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.body, req.user._id);

    return successResponse(res, 201, 'Task created successfully', { task });
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @route   GET /api/v1/tasks
 * @desc    Get all tasks with filters and pagination
 * @access  Private
 */
const getTasks = async (req, res, next) => {
  try {
    const { tasks, pagination } = await taskService.getTasks(req.query);

    return paginatedResponse(res, tasks, pagination.currentPage, pagination.itemsPerPage, pagination.totalItems);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/tasks/:id
 * @desc    Get a single task by ID
 * @access  Private
 */
const getTask = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);

    return successResponse(res, 200, 'Task retrieved', { task });
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @route   PUT /api/v1/tasks/:id
 * @desc    Update a task
 * @access  Private (NGO - task creator only)
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body, req.user._id);

    return successResponse(res, 200, 'Task updated successfully', { task });
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @route   POST /api/v1/tasks/:id/match
 * @desc    Run smart matching to find best volunteers
 * @access  Private (NGO only)
 */
const smartMatch = async (req, res, next) => {
  try {
    const { limit, maxDistanceKm, minScore } = req.query;
    const result = await taskService.smartAssignTask(req.params.id, {
      limit: parseInt(limit) || 5,
      maxDistanceKm: parseInt(maxDistanceKm) || 100,
      minScore: parseFloat(minScore) || 0.2,
    });

    return successResponse(res, 200, 'Smart matching completed', {
      matchedVolunteers: result.matchedVolunteers,
      totalCandidates: result.totalCandidates,
    });
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @route   POST /api/v1/tasks/:id/assign
 * @desc    Manually assign volunteers to a task
 * @access  Private (NGO only)
 */
const assignVolunteers = async (req, res, next) => {
  try {
    const { volunteerIds } = req.body;
    if (!volunteerIds || !Array.isArray(volunteerIds)) {
      return errorResponse(res, 400, 'volunteerIds array is required');
    }

    const task = await taskService.assignVolunteers(req.params.id, volunteerIds, req.user._id);

    return successResponse(res, 200, 'Volunteers assigned successfully', { task });
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @route   POST /api/v1/tasks/:id/complete
 * @desc    Mark a task as complete (by assigned volunteer)
 * @access  Private (Volunteer only)
 */
const completeTask = async (req, res, next) => {
  try {
    const result = await taskService.completeTask(req.params.id, req.user._id);

    return successResponse(res, 200, 'Task completed! Points awarded 🎉', {
      task: result.task,
      gamification: result.gamification,
    });
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @route   GET /api/v1/tasks/nearby
 * @desc    Get tasks near a location
 * @access  Private
 * @query   lat, lng, radius (km), status, urgency, category
 */
const getNearbyTasks = async (req, res, next) => {
  try {
    const { lat, lng, radius = 50, status, urgency, category, limit = 50 } = req.query;

    if (!lat || !lng) {
      return errorResponse(res, 400, 'Latitude and longitude are required');
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseFloat(radius);
    const maxResults = parseInt(limit);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) {
      return errorResponse(res, 400, 'Invalid coordinates or radius');
    }

    const tasks = await taskService.getNearbyTasks({
      latitude,
      longitude,
      radiusKm,
      status,
      urgency,
      category,
      limit: maxResults
    });

    return successResponse(res, 200, 'Nearby tasks retrieved', {
      tasks,
      center: { lat: latitude, lng: longitude },
      radius: radiusKm,
      count: tasks.length
    });
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @route   POST /api/v1/tasks/:id/geocode
 * @desc    Geocode task address to coordinates
 * @access  Private (NGO only)
 */
const geocodeTask = async (req, res, next) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return errorResponse(res, 400, 'Address is required');
    }

    const task = await taskService.geocodeTaskAddress(req.params.id, address, req.user._id);

    return successResponse(res, 200, 'Task location updated', { task });
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.statusCode, error.message);
    }
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  smartMatch,
  assignVolunteers,
  completeTask,
  getNearbyTasks,
  geocodeTask,
};
