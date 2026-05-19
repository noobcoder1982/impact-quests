const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');

/**
 * Admin Routes
 * Base path: /api/v1/admin
 */

// ── NGO Verification (NGO users) ────────────────
// Submit verification request (NGO user)
router.post('/ngo-verify/submit', protect, adminController.submitVerification);
// Check own verification status (NGO user)
router.get('/ngo-verify/my-status', protect, adminController.getMyVerificationStatus);

// ── Admin Check ─────────────────────────────────
router.get('/check', protect, adminController.checkAdmin);

// ── Admin-Only Routes ───────────────────────────
// All routes below require admin access
router.get('/stats', protect, adminController.isAdmin, adminController.getAdminStats);
router.get('/tickets', protect, adminController.isAdmin, adminController.getAllTickets);
router.get('/tickets/:id', protect, adminController.isAdmin, adminController.getTicketById);
router.put('/tickets/:id/review', protect, adminController.isAdmin, adminController.reviewTicket);

// Admin management
router.get('/admins', protect, adminController.isAdmin, adminController.listAdmins);
router.post('/admins/add', protect, adminController.isAdmin, adminController.addAdmin);
router.post('/admins/remove', protect, adminController.isAdmin, adminController.removeAdmin);

module.exports = router;
