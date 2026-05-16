const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  // User reference for personal inventory items
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  // Item type for gamification system
  itemType: {
    type: String,
    enum: ['resource', 'badge', 'consumable', 'boost', 'cosmetic', 'skill']
  },
  
  // Rarity system for gamification
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  
  // How the item was earned
  earnedFrom: {
    type: String,
    enum: ['task', 'achievement', 'streak', 'event', 'purchase']
  },
  
  // When the item was earned
  earnedAt: {
    type: Date,
    default: Date.now
  },
  
  // Usage state for consumables and boosts
  usageState: {
    type: String,
    enum: ['available', 'in-use', 'consumed', 'expired'],
    default: 'available'
  },
  
  // Expiration for time-limited items
  expiresAt: {
    type: Date
  },
  
  // Flexible metadata for item-specific data
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Original fields for physical resource inventory
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Medical & Healthcare', 'Rescue & Tactical', 'Food & Water', 'Logistics & Power', 'Shelter & Comfort', 'Badge', 'Boost', 'Consumable', 'Cosmetic', 'Skill']
  },
  quantity: {
    type: Number,
    default: 1
  },
  unit: {
    type: String,
    default: 'item'
  },
  condition: {
    type: String,
    enum: ['New', 'Operational', 'Pristine', 'Maintenance', 'Fresh', 'Certified', 'Charged', 'Active', 'Good', 'Sealed'],
    default: 'Operational'
  },
  location: {
    type: String
  },
  status: {
    type: String,
    enum: ['Ready', 'Active', 'Maintenance', 'Sealed'],
    default: 'Ready'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient user inventory queries
inventorySchema.index({ userId: 1, itemType: 1 });
inventorySchema.index({ userId: 1, rarity: 1 });
inventorySchema.index({ userId: 1, usageState: 1 });

// Pre-save hook to update lastUpdated
inventorySchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
