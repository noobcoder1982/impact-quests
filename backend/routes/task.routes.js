const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { validate, createTaskSchema, updateTaskSchema } = require('../validators/task.validator');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * Task Routes
 * Base path: /api/v1/tasks
 * All routes require authentication
 */

// All task routes require login
router.use(protect);

// ── Task CRUD ─────────────────────────────────

// Create a new task (NGO only)
router.post('/', authorize('ngo'), validate(createTaskSchema), taskController.createTask);

// Get all tasks (both roles)
router.get('/', taskController.getTasks);

// Get nearby tasks (both roles) - MUST be before /:id route
router.get('/nearby', taskController.getNearbyTasks);

// Get single task
router.get('/:id', taskController.getTask);

// Update a task (NGO - creator only)
router.put('/:id', authorize('ngo'), validate(updateTaskSchema), taskController.updateTask);

// ── Smart Matching & Assignment ──────────────

// Run smart matching on a task (NGO only)
router.post('/:id/match', authorize('ngo'), taskController.smartMatch);

// Manually assign volunteers to a task (NGO only)
router.post('/:id/assign', authorize('ngo'), taskController.assignVolunteers);

// ── Task Completion ─────────────────────────

// Mark task as complete (Volunteer only)
router.post('/:id/complete', authorize('volunteer'), taskController.completeTask);

// ── Geocoding ───────────────────────────────

// Geocode task address (NGO only)
router.post('/:id/geocode', authorize('ngo'), taskController.geocodeTask);

module.exports = router;
