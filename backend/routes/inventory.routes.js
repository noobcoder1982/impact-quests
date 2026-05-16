const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { protect } = require('../middleware/auth.middleware');

/**
 * Inventory Routes
 * Base path: /api/v1/inventory
 * All routes require authentication
 */

// All inventory routes require login
router.use(protect);

// ── Inventory Management ─────────────────────────────────

// Get user's inventory with filters
router.get('/', inventoryController.getUserInventory);

// Get inventory statistics
router.get('/stats', inventoryController.getInventoryStats);

// Award item to user
router.post('/earn', inventoryController.earnItem);

// Use/consume an item
router.put('/:id/use', inventoryController.useItem);

// Remove item from inventory
router.delete('/:id', inventoryController.removeItem);

module.exports = router;

// Made with Bob
