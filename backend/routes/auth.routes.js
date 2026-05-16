const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate, registerVolunteerSchema, registerNGOSchema, registerCustomerSchema, loginSchema } = require('../validators/auth.validator');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * Auth Routes
 * Base path: /api/v1/auth
 */

// ── Public Routes ────────────────────────────

// Register volunteer
router.post('/register/volunteer', validate(registerVolunteerSchema), authController.registerVolunteer);

// Register NGO
router.post('/register/ngo', validate(registerNGOSchema), authController.registerNGO);

// Register Customer
router.post('/register/customer', validate(registerCustomerSchema), authController.registerCustomer);

// Login (both roles)
router.post('/login', validate(loginSchema), authController.login);

// Refresh token
router.post('/refresh', authController.refreshToken);

// Firebase login
router.post('/firebase-login', authController.firebaseLogin);

// ── Protected Routes ─────────────────────────

// Get current user profile
router.get('/me', protect, authController.getMe);
router.put('/update-ngo', protect, authorize('ngo'), authController.updateNGO);
router.put('/update-profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);
router.post('/complete-onboarding', protect, authController.completeOnboarding);

module.exports = router;
