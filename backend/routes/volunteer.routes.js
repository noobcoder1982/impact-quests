const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteer.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * Volunteer Routes
 * Base path: /api/v1/volunteers
 * All routes require authentication
 */

// All volunteer routes require login
router.use(protect);

// ── Read Operations ──────────────────────────

// Get leaderboard (must be before /:id to avoid conflict)
router.get('/leaderboard', volunteerController.getLeaderboard);

// Get all volunteers
router.get('/', volunteerController.getVolunteers);

// Get single volunteer
router.get('/:id', volunteerController.getVolunteer);

// Get volunteer badges
router.get('/:id/badges', volunteerController.getVolunteerBadges);

// ── Update Operations ────────────────────────

// Update own profile (Volunteer only)
router.put('/update', authorize('volunteer'), volunteerController.updateVolunteer);

module.exports = router;
