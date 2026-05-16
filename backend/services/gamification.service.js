const User = require('../models/User');

/**
 * Gamification Service
 * ─────────────────────────────────────────────────────
 * Manages the gamification loop:
 *   Task Completed → Add Points → Check Level → Assign Badges → Update Streak
 *
 * Point System:
 *   low urgency    → 10 pts
 *   medium urgency → 20 pts
 *   high urgency   → 40 pts
 *   critical       → 80 pts
 *
 * Level Thresholds:
 *   L1: 0, L2: 100, L3: 300, L4: 600, L5: 1000,
 *   L6: 1500, L7: 2500, L8: 4000, L9: 6000, L10: 10000
 *
 * Badges (milestone-based):
 *   - First Steps: Complete first task
 *   - Helping Hand: Complete 5 tasks
 *   - Community Hero: Complete 25 tasks
 *   - Legend: Complete 100 tasks
 *   - Streak Master: Maintain 7-day streak
 *   - Specialist: All skills matched on 10+ tasks
 *   - Rapid Responder: Complete 5 critical tasks
 */

// ── Badge Definitions ────────────────────────────
const BADGE_DEFINITIONS = [
  { id: 'first_steps', name: '🌱 First Steps', description: 'Completed your first task', requirement: (user) => user.tasksCompleted >= 1 },
  { id: 'helping_hand', name: '🤝 Helping Hand', description: 'Completed 5 tasks', requirement: (user) => user.tasksCompleted >= 5 },
  { id: 'rising_star', name: '⭐ Rising Star', description: 'Reached Level 3', requirement: (user) => user.level >= 3 },
  { id: 'community_hero', name: '🦸 Community Hero', description: 'Completed 25 tasks', requirement: (user) => user.tasksCompleted >= 25 },
  { id: 'centurion', name: '🏛️ Centurion', description: 'Earned 500+ points', requirement: (user) => user.points >= 500 },
  { id: 'legend', name: '🏆 Legend', description: 'Completed 100 tasks', requirement: (user) => user.tasksCompleted >= 100 },
  { id: 'streak_3', name: '🔥 On Fire', description: 'Maintained a 3-day streak', requirement: (user) => user.currentStreak >= 3 },
  { id: 'streak_7', name: '💎 Streak Master', description: 'Maintained a 7-day streak', requirement: (user) => user.currentStreak >= 7 },
  { id: 'reliable', name: '🛡️ Reliable', description: 'Reliability score above 80', requirement: (user) => user.reliabilityScore >= 80 },
  { id: 'elite', name: '👑 Elite', description: 'Reached Level 5+', requirement: (user) => user.level >= 5 },
];

// ── Level Thresholds ─────────────────────────────
const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000];

/**
 * Award points for completing a task
 *
 * @param {string} volunteerId - The volunteer's user ID
 * @param {Object} task - The completed task
 * @returns {Object} Updated gamification state
 */
const awardPoints = async (volunteerId, task) => {
  try {
    const user = await User.findById(volunteerId);
    if (!user || user.role !== 'volunteer') {
      throw { statusCode: 400, message: 'Invalid volunteer' };
    }

    // Calculate points based on urgency
    const urgencyPoints = {
      low: 10,
      medium: 20,
      high: 40,
      critical: 80,
    };

    const pointsEarned = urgencyPoints[task.urgency] || 10;

    // Update user stats
    user.points += pointsEarned;
    user.tasksCompleted += 1;

    // Update streak
    user.currentStreak += 1;
    if (user.currentStreak > user.longestStreak) {
      user.longestStreak = user.currentStreak;
    }

    // Recalculate level
    const previousLevel = user.level;
    user.calculateLevel();
    const leveledUp = user.level > previousLevel;

    // Update reliability score (moving average)
    // Each completed task slightly increases reliability
    user.reliabilityScore = Math.min(100,
      user.reliabilityScore + (100 - user.reliabilityScore) * 0.05
    );

    // Check and award new badges
    const newBadges = checkAndAwardBadges(user);

    await user.save();

    return {
      pointsEarned,
      totalPoints: user.points,
      level: user.level,
      leveledUp,
      previousLevel,
      newBadges,
      currentStreak: user.currentStreak,
      reliabilityScore: Math.round(user.reliabilityScore * 100) / 100,
      tasksCompleted: user.tasksCompleted,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Check and award new badges to user
 *
 * @param {Object} user - The user document (modified in-place)
 * @returns {Array} Newly awarded badges
 */
const checkAndAwardBadges = (user) => {
  const existingBadgeIds = user.badges.map((b) => b.name);
  const newBadges = [];

  for (const badge of BADGE_DEFINITIONS) {
    // Skip if already awarded
    if (existingBadgeIds.includes(badge.name)) continue;

    // Check if requirement is met
    if (badge.requirement(user)) {
      const newBadge = {
        name: badge.name,
        description: badge.description,
        awardedAt: new Date(),
      };
      user.badges.push(newBadge);
      newBadges.push(newBadge);
    }
  }

  return newBadges;
};

/**
 * Penalize a volunteer for dropping a task
 * Reduces reliability score
 *
 * @param {string} volunteerId - The volunteer's user ID
 */
const penalizeTaskDrop = async (volunteerId) => {
  try {
    const user = await User.findById(volunteerId);
    if (!user) return;

    // Reduce reliability by 10 points (min 0)
    user.reliabilityScore = Math.max(0, user.reliabilityScore - 10);

    // Reset streak
    user.currentStreak = 0;

    await user.save();

    return {
      reliabilityScore: user.reliabilityScore,
      currentStreak: 0,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get leaderboard
 * Returns top volunteers ranked by points
 *
 * @param {number} limit - Number of top volunteers to return
 * @returns {Array} Ranked leaderboard
 */
const getLeaderboard = async (limit = 10) => {
  try {
    const leaderboard = await User.find({ role: 'volunteer' })
      .select('name points level badges tasksCompleted reliabilityScore currentStreak')
      .sort({ points: -1 })
      .limit(limit);

    return leaderboard.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      points: user.points,
      level: user.level,
      tasksCompleted: user.tasksCompleted,
      badgeCount: user.badges.length,
      reliabilityScore: user.reliabilityScore,
      currentStreak: user.currentStreak,
    }));
  } catch (error) {
    throw error;
  }
};

module.exports = {
  awardPoints,
  penalizeTaskDrop,
  getLeaderboard,
  checkAndAwardBadges,
  BADGE_DEFINITIONS,
  LEVEL_THRESHOLDS,
};
