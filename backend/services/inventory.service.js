const Inventory = require('../models/Inventory');
const User = require('../models/User');
const Task = require('../models/Task');

/**
 * Inventory Service
 * ─────────────────────────────────────────────────────
 * Manages user inventory items, achievements, and rewards
 * 
 * Item Types:
 *   - resource: Physical resources (medical, food, etc.)
 *   - badge: Achievement badges
 *   - consumable: One-time use items
 *   - boost: Temporary XP/energy multipliers
 *   - cosmetic: Visual customizations
 *   - skill: Skill unlocks or enhancements
 * 
 * Rarity Levels:
 *   - common: Basic items
 *   - uncommon: Slightly better items
 *   - rare: Good items
 *   - epic: Very good items
 *   - legendary: Best items
 */

// ── Achievement Definitions ────────────────────────────
const ACHIEVEMENT_BADGES = [
  {
    id: 'task_master_10',
    name: '🎯 Task Master',
    description: 'Completed 10 tasks',
    category: 'Badge',
    rarity: 'uncommon',
    requirement: (user) => user.tasksCompleted >= 10
  },
  {
    id: 'task_champion_50',
    name: '🏆 Task Champion',
    description: 'Completed 50 tasks',
    category: 'Badge',
    rarity: 'rare',
    requirement: (user) => user.tasksCompleted >= 50
  },
  {
    id: 'task_legend_100',
    name: '👑 Task Legend',
    description: 'Completed 100 tasks',
    category: 'Badge',
    rarity: 'epic',
    requirement: (user) => user.tasksCompleted >= 100
  },
  {
    id: 'task_deity_500',
    name: '⚡ Task Deity',
    description: 'Completed 500 tasks',
    category: 'Badge',
    rarity: 'legendary',
    requirement: (user) => user.tasksCompleted >= 500
  },
  {
    id: 'streak_warrior_7',
    name: '🔥 Streak Warrior',
    description: 'Maintained 7-day streak',
    category: 'Badge',
    rarity: 'uncommon',
    requirement: (user) => user.currentStreak >= 7
  },
  {
    id: 'streak_champion_30',
    name: '💎 Streak Champion',
    description: 'Maintained 30-day streak',
    category: 'Badge',
    rarity: 'epic',
    requirement: (user) => user.currentStreak >= 30
  },
  {
    id: 'streak_legend_100',
    name: '🌟 Streak Legend',
    description: 'Maintained 100-day streak',
    category: 'Badge',
    rarity: 'legendary',
    requirement: (user) => user.currentStreak >= 100
  },
  {
    id: 'point_collector_1000',
    name: '💰 Point Collector',
    description: 'Earned 1000 points',
    category: 'Badge',
    rarity: 'rare',
    requirement: (user) => user.points >= 1000
  },
  {
    id: 'point_master_5000',
    name: '💎 Point Master',
    description: 'Earned 5000 points',
    category: 'Badge',
    rarity: 'epic',
    requirement: (user) => user.points >= 5000
  },
  {
    id: 'reliable_volunteer',
    name: '🛡️ Reliable Volunteer',
    description: 'Reliability score above 90',
    category: 'Badge',
    rarity: 'rare',
    requirement: (user) => user.reliabilityScore >= 90
  }
];

// ── Task Completion Rewards ────────────────────────────
const TASK_REWARDS = {
  low: [
    { itemType: 'consumable', name: 'Energy Drink', category: 'Consumable', rarity: 'common', chance: 0.3 }
  ],
  medium: [
    { itemType: 'consumable', name: 'Energy Drink', category: 'Consumable', rarity: 'common', chance: 0.4 },
    { itemType: 'boost', name: 'XP Boost (1h)', category: 'Boost', rarity: 'uncommon', chance: 0.2 }
  ],
  high: [
    { itemType: 'boost', name: 'XP Boost (2h)', category: 'Boost', rarity: 'rare', chance: 0.3 },
    { itemType: 'consumable', name: 'Super Energy Drink', category: 'Consumable', rarity: 'uncommon', chance: 0.3 }
  ],
  critical: [
    { itemType: 'boost', name: 'XP Boost (4h)', category: 'Boost', rarity: 'epic', chance: 0.4 },
    { itemType: 'cosmetic', name: 'Hero Badge', category: 'Cosmetic', rarity: 'rare', chance: 0.2 }
  ]
};

/**
 * Award items to user based on task completion
 * 
 * @param {string} userId - User ID
 * @param {string} taskId - Task ID
 * @returns {Object} Awarded items
 */
const awardItemForTask = async (userId, taskId) => {
  try {
    const task = await Task.findById(taskId);
    if (!task) {
      throw { statusCode: 404, message: 'Task not found' };
    }

    const rewards = TASK_REWARDS[task.urgency] || TASK_REWARDS.low;
    const awardedItems = [];

    // Roll for each possible reward
    for (const reward of rewards) {
      if (Math.random() < reward.chance) {
        const item = await Inventory.create({
          userId,
          itemType: reward.itemType,
          name: reward.name,
          category: reward.category,
          rarity: reward.rarity,
          earnedFrom: 'task',
          metadata: {
            taskId: task._id,
            taskTitle: task.title,
            urgency: task.urgency
          },
          quantity: 1,
          unit: 'item',
          usageState: 'available'
        });
        awardedItems.push(item);
      }
    }

    return awardedItems;
  } catch (error) {
    throw error;
  }
};

/**
 * Check and award achievement badges
 * 
 * @param {string} userId - User ID
 * @returns {Array} Newly awarded badges
 */
const checkAchievements = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    // Get existing badge IDs
    const existingBadges = await Inventory.find({
      userId,
      itemType: 'badge'
    }).select('metadata.badgeId');
    
    const existingBadgeIds = existingBadges.map(b => b.metadata?.badgeId).filter(Boolean);
    const newBadges = [];

    // Check each achievement
    for (const achievement of ACHIEVEMENT_BADGES) {
      // Skip if already awarded
      if (existingBadgeIds.includes(achievement.id)) continue;

      // Check if requirement is met
      if (achievement.requirement(user)) {
        const badge = await Inventory.create({
          userId,
          itemType: 'badge',
          name: achievement.name,
          category: achievement.category,
          rarity: achievement.rarity,
          earnedFrom: 'achievement',
          metadata: {
            badgeId: achievement.id,
            description: achievement.description
          },
          quantity: 1,
          unit: 'badge',
          usageState: 'available'
        });
        newBadges.push(badge);
      }
    }

    return newBadges;
  } catch (error) {
    throw error;
  }
};

/**
 * Calculate and award streak rewards
 * 
 * @param {string} userId - User ID
 * @returns {Array} Awarded items
 */
const calculateStreakRewards = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    const rewards = [];
    const streak = user.currentStreak;

    // Award items at streak milestones
    if (streak === 7) {
      const item = await Inventory.create({
        userId,
        itemType: 'boost',
        name: 'Week Warrior Boost',
        category: 'Boost',
        rarity: 'uncommon',
        earnedFrom: 'streak',
        metadata: {
          streakDays: 7,
          boostMultiplier: 1.5,
          duration: 24 // hours
        },
        quantity: 1,
        unit: 'item',
        usageState: 'available',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days to use
      });
      rewards.push(item);
    }

    if (streak === 30) {
      const item = await Inventory.create({
        userId,
        itemType: 'boost',
        name: 'Monthly Master Boost',
        category: 'Boost',
        rarity: 'rare',
        earnedFrom: 'streak',
        metadata: {
          streakDays: 30,
          boostMultiplier: 2.0,
          duration: 48 // hours
        },
        quantity: 1,
        unit: 'item',
        usageState: 'available',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days to use
      });
      rewards.push(item);
    }

    if (streak === 100) {
      const item = await Inventory.create({
        userId,
        itemType: 'boost',
        name: 'Century Champion Boost',
        category: 'Boost',
        rarity: 'legendary',
        earnedFrom: 'streak',
        metadata: {
          streakDays: 100,
          boostMultiplier: 3.0,
          duration: 72 // hours
        },
        quantity: 1,
        unit: 'item',
        usageState: 'available',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days to use
      });
      rewards.push(item);
    }

    return rewards;
  } catch (error) {
    throw error;
  }
};

/**
 * Apply a boost to user
 * 
 * @param {string} userId - User ID
 * @param {string} boostId - Boost item ID
 * @returns {Object} Boost details
 */
const applyBoost = async (userId, boostId) => {
  try {
    const boost = await Inventory.findOne({
      _id: boostId,
      userId,
      itemType: 'boost'
    });

    if (!boost) {
      throw { statusCode: 404, message: 'Boost not found or does not belong to you' };
    }

    if (boost.usageState !== 'available') {
      throw { statusCode: 400, message: `Boost is ${boost.usageState} and cannot be used` };
    }

    // Check if expired
    if (boost.expiresAt && new Date(boost.expiresAt) < new Date()) {
      boost.usageState = 'expired';
      await boost.save();
      throw { statusCode: 400, message: 'Boost has expired' };
    }

    // Activate boost
    boost.usageState = 'in-use';
    
    // Set expiration based on duration in metadata
    const durationHours = boost.metadata?.duration || 24;
    boost.expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);
    
    await boost.save();

    return {
      boost,
      multiplier: boost.metadata?.boostMultiplier || 1.5,
      expiresAt: boost.expiresAt
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get active boosts for user
 * 
 * @param {string} userId - User ID
 * @returns {Array} Active boosts
 */
const getActiveBoosts = async (userId) => {
  try {
    const now = new Date();
    
    const activeBoosts = await Inventory.find({
      userId,
      itemType: 'boost',
      usageState: 'in-use',
      expiresAt: { $gt: now }
    });

    // Mark expired boosts
    await Inventory.updateMany(
      {
        userId,
        itemType: 'boost',
        usageState: 'in-use',
        expiresAt: { $lte: now }
      },
      { usageState: 'expired' }
    );

    return activeBoosts;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  awardItemForTask,
  checkAchievements,
  calculateStreakRewards,
  applyBoost,
  getActiveBoosts,
  ACHIEVEMENT_BADGES,
  TASK_REWARDS
};

// Made with Bob
