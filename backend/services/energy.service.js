const User = require('../models/User.js');
const Task = require('../models/Task.js');
const { callAI } = require('../utils/ai.util.js');

/**
 * Energy Service
 * Manages user energy levels, burnout detection, and anti-abuse logic
 */

/**
 * Calculate energy impact based on task and user feedback
 * @param {Object} task - Task object
 * @param {Number} duration - Task duration in hours
 * @param {Object} userFeedback - User's post-task feedback
 * @returns {Object} { energyChange, burnoutRisk, recommendation }
 */
const calculateEnergyImpact = (task, duration, userFeedback) => {
  let energyChange = 0;
  let burnoutRisk = 'low';
  const recommendations = [];

  // Base energy cost by task urgency
  const urgencyImpact = {
    low: 5,      // Gain energy (easy task)
    medium: 0,   // Neutral
    high: -10,   // Lose energy
    critical: -20 // Significant energy loss
  };

  energyChange += urgencyImpact[task.urgency] || 0;

  // Duration impact: -5 energy per hour
  energyChange -= duration * 5;

  // User feedback adjustments
  if (userFeedback.mentalDrain) {
    const drainImpact = {
      'very-low': 5,
      'low': 0,
      'medium': -5,
      'high': -10,
      'very-high': -15
    };
    energyChange += drainImpact[userFeedback.mentalDrain] || 0;
  }

  if (userFeedback.focusQuality) {
    const focusImpact = {
      1: -10, // Very poor focus
      2: -5,
      3: 0,
      4: 3,
      5: 5    // Excellent focus
    };
    energyChange += focusImpact[userFeedback.focusQuality] || 0;
  }

  // Actual difficulty vs expected
  if (userFeedback.actualDifficulty && task.urgency) {
    const difficultyMap = { easy: 1, medium: 2, hard: 3, 'very-hard': 4 };
    const urgencyMap = { low: 1, medium: 2, high: 3, critical: 4 };
    
    const actualDiff = difficultyMap[userFeedback.actualDifficulty];
    const expectedDiff = urgencyMap[task.urgency];
    
    // If task was harder than expected, more energy loss
    if (actualDiff > expectedDiff) {
      energyChange -= (actualDiff - expectedDiff) * 5;
    }
  }

  // Capacity for more work
  if (userFeedback.capacityForMore === 'no') {
    burnoutRisk = 'medium';
    recommendations.push('Consider taking a break before accepting new tasks');
  } else if (userFeedback.capacityForMore === 'maybe') {
    recommendations.push('Take on lighter tasks if possible');
  }

  // Determine burnout risk based on total energy change
  if (energyChange <= -30) {
    burnoutRisk = 'high';
    recommendations.push('High energy depletion detected. Rest is strongly recommended.');
  } else if (energyChange <= -15) {
    burnoutRisk = 'medium';
    recommendations.push('Moderate energy depletion. Consider lighter tasks.');
  }

  return {
    energyChange: Math.round(energyChange),
    burnoutRisk,
    recommendations
  };
};

/**
 * Validate feedback for anti-abuse detection
 * @param {String} userId - User ID
 * @param {Object} feedback - User feedback
 * @returns {Object} { validated, adjustedFeedback, trustImpact }
 */
const validateFeedback = async (userId, feedback) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Get user's recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentTasks = await Task.find({
    assignedTo: userId,
    status: 'completed',
    updatedAt: { $gte: sevenDaysAgo }
  });

  const recentActivity = {
    tasksCompleted: recentTasks.length,
    timeActive: recentTasks.reduce((sum, task) => {
      const duration = task.completedAt && task.acceptedAt 
        ? (new Date(task.completedAt) - new Date(task.acceptedAt)) / (1000 * 60)
        : 0;
      return sum + duration;
    }, 0), // in minutes
    averageTasksPerDay: recentTasks.length / 7
  };

  let validated = true;
  let trustImpact = 0;
  const adjustedFeedback = { ...feedback };
  const suspiciousPatterns = [];

  // Pattern 1: Claims exhaustion but minimal work
  if ((feedback.mentalDrain === 'very-high' || feedback.mentalDrain === 'high') &&
      recentActivity.tasksCompleted < 2 &&
      recentActivity.timeActive < 60) {
    suspiciousPatterns.push('Claims high exhaustion with minimal recent activity');
    trustImpact -= 5;
    
    // Reduce feedback impact
    if (adjustedFeedback.mentalDrain === 'very-high') {
      adjustedFeedback.mentalDrain = 'high';
    } else if (adjustedFeedback.mentalDrain === 'high') {
      adjustedFeedback.mentalDrain = 'medium';
    }
  }

  // Pattern 2: Repeated exhaustion claims without consistent work
  const recentEnergyHistory = user.energy.history.slice(-10);
  const exhaustionClaims = recentEnergyHistory.filter(h => 
    h.reason && h.reason.includes('high drain')
  ).length;

  if (exhaustionClaims > 5 && recentActivity.averageTasksPerDay < 1) {
    suspiciousPatterns.push('Repeated exhaustion claims without consistent work pattern');
    trustImpact -= 10;
    validated = false;
  }

  // Pattern 3: Capacity claims don't match activity
  if (feedback.capacityForMore === 'no' && 
      recentActivity.tasksCompleted < 1 &&
      user.energy.current > 60) {
    suspiciousPatterns.push('Claims no capacity despite high energy and low activity');
    trustImpact -= 3;
    adjustedFeedback.capacityForMore = 'maybe';
  }

  // Pattern 4: Inconsistent difficulty ratings
  if (feedback.actualDifficulty === 'very-hard' && 
      recentActivity.timeActive < 30) {
    suspiciousPatterns.push('Claims very hard task but minimal time spent');
    trustImpact -= 5;
  }

  // Positive patterns: Increase trust
  if (recentActivity.tasksCompleted >= 5 && 
      recentActivity.averageTasksPerDay >= 1) {
    trustImpact += 2; // Reward consistent contributors
  }

  // Update user trust score
  if (trustImpact !== 0) {
    user.trustScore = Math.max(0, Math.min(100, user.trustScore + trustImpact));
    await user.save();
  }

  return {
    validated,
    adjustedFeedback,
    trustImpact,
    suspiciousPatterns,
    trustScore: user.trustScore
  };
};

/**
 * Update user energy after task completion
 * @param {String} userId - User ID
 * @param {String} taskId - Task ID
 * @param {Object} feedback - User feedback
 * @returns {Object} Updated energy status
 */
const updateEnergyAfterTask = async (userId, taskId, feedback) => {
  const user = await User.findById(userId);
  const task = await Task.findById(taskId);

  if (!user) throw new Error('User not found');
  if (!task) throw new Error('Task not found');

  // Validate feedback with anti-abuse logic
  const validation = await validateFeedback(userId, feedback);
  const adjustedFeedback = validation.adjustedFeedback;

  // Calculate task duration in hours
  const duration = task.completedAt && task.acceptedAt
    ? (new Date(task.completedAt) - new Date(task.acceptedAt)) / (1000 * 60 * 60)
    : 1; // Default 1 hour if not tracked

  // Calculate energy impact
  const impact = calculateEnergyImpact(task, duration, adjustedFeedback);

  // Apply trust score weighting
  const trustWeight = user.trustScore / 100;
  const weightedEnergyChange = Math.round(impact.energyChange * trustWeight);

  // Update energy
  const previousEnergy = user.energy.current;
  user.energy.current = Math.max(0, Math.min(100, user.energy.current + weightedEnergyChange));
  user.energy.lastUpdated = new Date();

  // Add to energy history (keep last 30 entries)
  user.energy.history.push({
    value: user.energy.current,
    timestamp: new Date(),
    reason: `Task completed: ${task.title} (${weightedEnergyChange > 0 ? '+' : ''}${weightedEnergyChange} energy, ${adjustedFeedback.mentalDrain || 'unknown'} drain)`
  });

  if (user.energy.history.length > 30) {
    user.energy.history = user.energy.history.slice(-30);
  }

  // Update burnout score
  if (user.energy.current < 30) {
    user.burnoutScore = Math.min(100, user.burnoutScore + 5);
  } else if (user.energy.current > 70) {
    user.burnoutScore = Math.max(0, user.burnoutScore - 3);
  }

  // Update focus score based on feedback
  if (adjustedFeedback.focusQuality) {
    const focusChange = (adjustedFeedback.focusQuality - 3) * 5; // -10 to +10
    user.focusScore = Math.max(0, Math.min(100, user.focusScore + focusChange * 0.3));
  }

  // Update activity patterns
  const now = new Date();
  const hour = now.getHours();
  
  if (!user.activityPatterns.peakProductivityHours) {
    user.activityPatterns.peakProductivityHours = [];
  }
  
  // Track peak hours (when focus is high)
  if (adjustedFeedback.focusQuality >= 4) {
    if (!user.activityPatterns.peakProductivityHours.includes(hour)) {
      user.activityPatterns.peakProductivityHours.push(hour);
    }
  }

  user.activityPatterns.lastActive = now;

  // Calculate average tasks per day (rolling 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentTaskCount = await Task.countDocuments({
    assignedTo: userId,
    status: 'completed',
    updatedAt: { $gte: thirtyDaysAgo }
  });
  user.activityPatterns.averageTasksPerDay = recentTaskCount / 30;

  await user.save();

  return {
    energy: {
      current: user.energy.current,
      max: user.energy.max,
      change: weightedEnergyChange,
      previousValue: previousEnergy
    },
    burnout: {
      score: user.burnoutScore,
      risk: impact.burnoutRisk
    },
    focus: {
      score: user.focusScore
    },
    trust: {
      score: user.trustScore,
      impact: validation.trustImpact,
      validated: validation.validated
    },
    recommendations: impact.recommendations,
    validation: {
      suspicious: validation.suspiciousPatterns.length > 0,
      patterns: validation.suspiciousPatterns
    }
  };
};

/**
 * Detect burnout risk for a user
 * @param {String} userId - User ID
 * @returns {Object} Burnout analysis
 */
const detectBurnout = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const factors = [];
  let risk = 'low';

  // Factor 1: Low energy for extended period
  const recentHistory = user.energy.history.slice(-21); // Last 3 weeks
  const lowEnergyDays = recentHistory.filter(h => h.value < 30).length;
  
  if (lowEnergyDays >= 3) {
    factors.push(`Low energy (<30) for ${lowEnergyDays} recent entries`);
    risk = 'medium';
  }

  // Factor 2: High burnout score
  if (user.burnoutScore > 70) {
    factors.push(`High burnout score: ${user.burnoutScore}/100`);
    risk = 'high';
  } else if (user.burnoutScore > 50) {
    factors.push(`Elevated burnout score: ${user.burnoutScore}/100`);
    if (risk === 'low') risk = 'medium';
  }

  // Factor 3: Declining focus score
  if (user.focusScore < 40) {
    factors.push(`Low focus score: ${user.focusScore}/100`);
    if (risk === 'low') risk = 'medium';
    if (risk === 'medium') risk = 'high';
  }

  // Factor 4: Overwork pattern
  if (user.activityPatterns.averageTasksPerDay > user.workloadCapacity * 1.5) {
    factors.push(`Exceeding workload capacity: ${user.activityPatterns.averageTasksPerDay.toFixed(1)} tasks/day vs ${user.workloadCapacity} capacity`);
    if (risk === 'medium') risk = 'high';
  }

  // Factor 5: Critical energy level
  if (user.energy.current < 20) {
    factors.push(`Critical energy level: ${user.energy.current}/100`);
    risk = 'critical';
  }

  // Generate recommendations
  const recommendations = [];
  
  if (risk === 'critical' || risk === 'high') {
    recommendations.push('🚨 Take immediate rest - avoid new tasks for 24-48 hours');
    recommendations.push('Consider reducing your workload capacity temporarily');
    recommendations.push('Focus on self-care and recovery activities');
  } else if (risk === 'medium') {
    recommendations.push('⚠️ Take lighter tasks for the next few days');
    recommendations.push('Ensure adequate breaks between tasks');
    recommendations.push('Monitor your energy levels closely');
  } else {
    recommendations.push('✅ Energy levels are healthy');
    recommendations.push('Continue maintaining good work-life balance');
  }

  return {
    risk,
    factors,
    recommendations,
    metrics: {
      energy: user.energy.current,
      burnout: user.burnoutScore,
      focus: user.focusScore,
      workload: user.activityPatterns.averageTasksPerDay
    }
  };
};

/**
 * Suggest optimal workload for user
 * @param {String} userId - User ID
 * @returns {Object} Workload suggestions
 */
const suggestWorkload = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const burnoutAnalysis = await detectBurnout(userId);
  
  let recommendedTasks = user.workloadCapacity;
  let restNeeded = false;
  const suggestions = [];

  // Adjust based on energy level
  if (user.energy.current < 30) {
    recommendedTasks = 0;
    restNeeded = true;
    suggestions.push('🛑 Energy critically low - rest required');
  } else if (user.energy.current < 50) {
    recommendedTasks = Math.max(1, Math.floor(user.workloadCapacity * 0.5));
    suggestions.push('⚡ Energy below optimal - take 1-2 light tasks maximum');
  } else if (user.energy.current < 70) {
    recommendedTasks = Math.floor(user.workloadCapacity * 0.75);
    suggestions.push('📊 Moderate energy - pace yourself with medium workload');
  } else {
    suggestions.push('✨ High energy - you can take on your full capacity');
  }

  // Adjust based on burnout risk
  if (burnoutAnalysis.risk === 'critical' || burnoutAnalysis.risk === 'high') {
    recommendedTasks = 0;
    restNeeded = true;
    suggestions.push('🚨 Burnout risk detected - mandatory rest period');
  } else if (burnoutAnalysis.risk === 'medium') {
    recommendedTasks = Math.min(recommendedTasks, 2);
    suggestions.push('⚠️ Elevated burnout risk - limit to 2 tasks maximum');
  }

  // Adjust based on trust score (anti-abuse)
  if (user.trustScore < 50) {
    recommendedTasks = Math.min(recommendedTasks, 1);
    suggestions.push('⚖️ Building trust - start with one task to establish pattern');
  }

  // Peak productivity hours suggestion
  if (user.activityPatterns.peakProductivityHours && 
      user.activityPatterns.peakProductivityHours.length > 0) {
    const currentHour = new Date().getHours();
    const isPeakHour = user.activityPatterns.peakProductivityHours.includes(currentHour);
    
    if (isPeakHour && user.energy.current > 60) {
      suggestions.push(`🎯 Peak productivity hour! Great time for challenging tasks`);
    }
  }

  return {
    recommendedTasks: Math.max(0, recommendedTasks),
    restNeeded,
    suggestions,
    burnoutRisk: burnoutAnalysis.risk,
    currentCapacity: user.workloadCapacity,
    energyLevel: user.energy.current,
    trustScore: user.trustScore
  };
};

module.exports = {
  calculateEnergyImpact,
  updateEnergyAfterTask,
  detectBurnout,
  suggestWorkload,
  validateFeedback
};

// Made with Bob
