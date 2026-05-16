const User = require('../models/User');
const { haversineDistance, distanceToScore } = require('../utils/distance.util');

/**
 * Smart Matching Service
 * ─────────────────────────────────────────────────────
 * The CORE BRAIN of the platform.
 *
 * Matches volunteers to tasks using a multi-factor scoring system:
 *   score = (skillMatch * 0.4) + (distanceScore * 0.3) + (availabilityScore * 0.2) + (reliabilityScore * 0.1)
 *
 * Each factor is normalized to a 0–1 scale before weighting.
 */

// ── Scoring Weights ─────────────────────────────
const WEIGHTS = {
  skill: 0.4,
  distance: 0.3,
  availability: 0.2,
  reliability: 0.1,
};

/**
 * Calculate skill match score (0-1)
 * Measures what percentage of required skills the volunteer has
 *
 * @param {string[]} volunteerSkills - Skills the volunteer possesses
 * @param {string[]} requiredSkills - Skills required by the task
 * @returns {number} Score between 0 and 1
 */
const calculateSkillScore = (volunteerSkills, requiredSkills) => {
  if (!requiredSkills || requiredSkills.length === 0) return 1; // No skills required = full match
  if (!volunteerSkills || volunteerSkills.length === 0) return 0;

  // Normalize to lowercase for comparison
  const normalizedVolunteer = volunteerSkills.map((s) => s.toLowerCase().trim());
  const normalizedRequired = requiredSkills.map((s) => s.toLowerCase().trim());

  const matchCount = normalizedRequired.filter((skill) =>
    normalizedVolunteer.includes(skill)
  ).length;

  return matchCount / normalizedRequired.length;
};

/**
 * Calculate availability score (0-1)
 * Checks if the volunteer is available on the task deadline day
 *
 * @param {Array} volunteerAvailability - Volunteer's availability slots
 * @param {Date} taskDeadline - Task's deadline date
 * @returns {number} 1 if available, 0.5 if unknown, 0 if unavailable
 */
const calculateAvailabilityScore = (volunteerAvailability, taskDeadline) => {
  if (!volunteerAvailability || volunteerAvailability.length === 0) return 0.5; // Unknown = partial score

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const deadlineDay = days[new Date(taskDeadline).getDay()];

  const isAvailable = volunteerAvailability.some(
    (slot) => slot.day.toLowerCase() === deadlineDay
  );

  return isAvailable ? 1 : 0;
};

/**
 * Calculate reliability score (0-1)
 * Normalizes the volunteer's reliability from 0-100 scale to 0-1
 *
 * @param {number} reliabilityScore - Volunteer's reliability rating (0-100)
 * @returns {number} Normalized score between 0 and 1
 */
const calculateReliabilityScore = (reliabilityScore) => {
  return (reliabilityScore || 50) / 100;
};

/**
 * Find and rank the best matching volunteers for a task
 *
 * @param {Object} task - The task document
 * @param {Object} options - Options for matching
 * @param {number} options.limit - Maximum number of matches to return (default 5)
 * @param {number} options.maxDistanceKm - Maximum search radius in km (default 100)
 * @param {number} options.minScore - Minimum score threshold (default 0.2)
 * @returns {Array} Ranked array of { volunteer, score, breakdown }
 */
const findMatchingVolunteers = async (task, options = {}) => {
  const {
    limit = 5,
    maxDistanceKm = 100,
    minScore = 0.2,
  } = options;

  try {
    // Fetch all available volunteers (not assigned to too many active tasks)
    const volunteers = await User.find({
      role: 'volunteer',
      // Exclude volunteers already assigned to this task
      _id: { $nin: task.assignedVolunteers.map((a) => a.volunteer) },
    });

    if (volunteers.length === 0) return [];

    // Task coordinates (GeoJSON: [lng, lat])
    const [taskLng, taskLat] = task.location.coordinates;

    // Score each volunteer
    const scoredVolunteers = volunteers.map((volunteer) => {
      // 1. Skill Match Score
      const skillScore = calculateSkillScore(volunteer.skills, task.requiredSkills);

      // 2. Distance Score (using Haversine)
      let distScore = 0;
      let distance = maxDistanceKm; // Default max distance
      if (volunteer.location && volunteer.location.coordinates && volunteer.location.coordinates.length === 2) {
        const [volLng, volLat] = volunteer.location.coordinates;
        // Ignore [0,0] defaults in MongoDB which ruin distance matching
        if (volLng !== 0 || volLat !== 0) {
          distance = haversineDistance(volLat, volLng, taskLat, taskLng);
          distScore = distanceToScore(distance, maxDistanceKm);
        }
      }

      // 3. Availability Score
      const availScore = calculateAvailabilityScore(volunteer.availability, task.deadline);

      // 4. Reliability Score
      const reliScore = calculateReliabilityScore(volunteer.reliabilityScore);

      // ── Weighted Final Score ──
      const totalScore =
        skillScore * WEIGHTS.skill +
        distScore * WEIGHTS.distance +
        availScore * WEIGHTS.availability +
        reliScore * WEIGHTS.reliability;

      return {
        volunteer: {
          _id: volunteer._id,
          name: volunteer.name,
          email: volunteer.email,
          skills: volunteer.skills,
          location: volunteer.location,
          points: volunteer.points,
          level: volunteer.level,
          reliabilityScore: volunteer.reliabilityScore,
        },
        score: Math.round(totalScore * 1000) / 1000, // Round to 3 decimal places
        distance: Math.round(distance * 100) / 100, // km rounded to 2 decimals
        breakdown: {
          skillScore: Math.round(skillScore * 1000) / 1000,
          distanceScore: Math.round(distScore * 1000) / 1000,
          availabilityScore: availScore,
          reliabilityScore: reliScore,
        },
      };
    });

    // Filter by minimum score and sort by total score (descending)
    const rankedVolunteers = scoredVolunteers
      .filter((v) => v.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return rankedVolunteers;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findMatchingVolunteers,
  calculateSkillScore,
  calculateAvailabilityScore,
  calculateReliabilityScore,
  WEIGHTS,
};
