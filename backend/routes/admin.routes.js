const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');

/**
 * Admin Routes — Full Command Center
 * Base path: /api/v1/admin
 */

// ── NGO Verification (NGO users) ────────────────
router.post('/ngo-verify/submit', protect, adminController.submitVerification);
router.get('/ngo-verify/my-status', protect, adminController.getMyVerificationStatus);

// ── Admin Check ─────────────────────────────────
router.get('/check', protect, adminController.checkAdmin);

// ── Admin-Only Routes ───────────────────────────
// Dashboard & Stats
router.get('/stats', protect, adminController.isAdmin, adminController.getAdminStats);
router.get('/activity-feed', protect, adminController.isAdmin, adminController.getActivityFeed);

// NGO Verification Management
router.get('/tickets', protect, adminController.isAdmin, adminController.getAllTickets);
router.get('/tickets/:id', protect, adminController.isAdmin, adminController.getTicketById);
router.put('/tickets/:id/review', protect, adminController.isAdmin, adminController.reviewTicket);
router.post('/tickets/:id/ai-analyze', protect, adminController.isAdmin, adminController.analyzeNgo);

// Volunteer Management
router.get('/volunteers', protect, adminController.isAdmin, adminController.getVolunteers);
router.post('/volunteers/suspend', protect, adminController.isAdmin, adminController.suspendVolunteer);
router.post('/volunteers/unsuspend', protect, adminController.isAdmin, adminController.unsuspendVolunteer);

// Audit Logs
router.get('/audit-logs', protect, adminController.isAdmin, adminController.getAuditLogs);

// Admin User Management
router.get('/admins', protect, adminController.isAdmin, adminController.listAdmins);
router.post('/admins/add', protect, adminController.isAdmin, adminController.addAdmin);
router.post('/admins/remove', protect, adminController.isAdmin, adminController.removeAdmin);

module.exports = router;
