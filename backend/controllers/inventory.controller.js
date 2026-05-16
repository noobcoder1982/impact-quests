const Inventory = require('../models/Inventory');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response.util');

/**
 * Inventory Controller
 * Handles HTTP layer for user inventory operations
 */

/**
 * @route   GET /api/v1/inventory
 * @desc    Get user's inventory with filters
 * @access  Private
 */
const getUserInventory = async (req, res, next) => {
  try {
    const { itemType, rarity, usageState, page = 1, limit = 50 } = req.query;
    const userId = req.user._id;

    // Build filter query
    const filter = { userId };
    if (itemType) filter.itemType = itemType;
    if (rarity) filter.rarity = rarity;
    if (usageState) filter.usageState = usageState;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Inventory.countDocuments(filter);

    // Get inventory items
    const items = await Inventory.find(filter)
      .sort({ earnedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    return paginatedResponse(res, items, parseInt(page), parseInt(limit), total);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/inventory/earn
 * @desc    Award item to user
 * @access  Private
 */
const earnItem = async (req, res, next) => {
  try {
    const { itemType, name, category, rarity, earnedFrom, metadata, expiresAt } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!itemType || !name || !category || !earnedFrom) {
      return errorResponse(res, 400, 'Missing required fields: itemType, name, category, earnedFrom');
    }

    // Create inventory item
    const item = await Inventory.create({
      userId,
      itemType,
      name,
      category,
      rarity: rarity || 'common',
      earnedFrom,
      metadata: metadata || {},
      expiresAt: expiresAt || null,
      quantity: 1,
      unit: 'item',
      usageState: 'available'
    });

    return successResponse(res, 201, 'Item earned successfully! 🎉', { item });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return errorResponse(res, 400, 'Validation error', Object.values(error.errors).map(e => e.message));
    }
    next(error);
  }
};

/**
 * @route   PUT /api/v1/inventory/:id/use
 * @desc    Use/consume an inventory item
 * @access  Private
 */
const useItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find item and verify ownership
    const item = await Inventory.findOne({ _id: id, userId });
    if (!item) {
      return errorResponse(res, 404, 'Item not found or does not belong to you');
    }

    // Check if item is available
    if (item.usageState !== 'available') {
      return errorResponse(res, 400, `Item is ${item.usageState} and cannot be used`);
    }

    // Check if item is expired
    if (item.expiresAt && new Date(item.expiresAt) < new Date()) {
      item.usageState = 'expired';
      await item.save();
      return errorResponse(res, 400, 'Item has expired');
    }

    // Update usage state based on item type
    if (item.itemType === 'consumable') {
      item.usageState = 'consumed';
      item.quantity = 0;
    } else if (item.itemType === 'boost') {
      item.usageState = 'in-use';
      // Set expiration if not already set (default 24 hours)
      if (!item.expiresAt) {
        item.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }
    } else {
      return errorResponse(res, 400, 'This item type cannot be used');
    }

    await item.save();

    return successResponse(res, 200, 'Item used successfully', { item });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/v1/inventory/:id
 * @desc    Remove item from inventory
 * @access  Private
 */
const removeItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find and delete item
    const item = await Inventory.findOneAndDelete({ _id: id, userId });
    if (!item) {
      return errorResponse(res, 404, 'Item not found or does not belong to you');
    }

    return successResponse(res, 200, 'Item removed from inventory', { item });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/inventory/stats
 * @desc    Get inventory statistics
 * @access  Private
 */
const getInventoryStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get counts by type
    const typeStats = await Inventory.aggregate([
      { $match: { userId } },
      { $group: { _id: '$itemType', count: { $sum: 1 } } }
    ]);

    // Get counts by rarity
    const rarityStats = await Inventory.aggregate([
      { $match: { userId } },
      { $group: { _id: '$rarity', count: { $sum: 1 } } }
    ]);

    // Get total items
    const totalItems = await Inventory.countDocuments({ userId });

    // Get available items
    const availableItems = await Inventory.countDocuments({ userId, usageState: 'available' });

    const stats = {
      totalItems,
      availableItems,
      byType: typeStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      byRarity: rarityStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    };

    return successResponse(res, 200, 'Inventory stats retrieved', { stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserInventory,
  earnItem,
  useItem,
  removeItem,
  getInventoryStats
};

// Made with Bob
