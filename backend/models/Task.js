const mongoose = require('mongoose');

/**
 * Task Schema
 * Represents a volunteer task created by an NGO
 * Supports geospatial queries, urgency levels, and assignment tracking
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: true,
      enum: [
        'disaster-relief',
        'education',
        'healthcare',
        'environment',
        'community',
        'logistics',
        'technical',
        'other',
      ],
      default: 'other',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude] — GeoJSON format
        required: true,
      },
      address: {
        type: String,
        trim: true,
      },
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'assigned', 'in-progress', 'completed', 'verified', 'cancelled'],
      default: 'open',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must have a creator'],
    },
    assignedVolunteers: [
      {
        volunteer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['assigned', 'accepted', 'in-progress', 'completed', 'dropped'],
          default: 'assigned',
        },
      },
    ],
    requiredSkills: {
      type: [String],
      default: [],
    },
    maxVolunteers: {
      type: Number,
      default: 1,
      min: 1,
      max: 100,
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },

    // ── Gamification Points ─────────────────
    pointsReward: {
      type: Number,
      default: 10,
    },

    // ── Matching Metadata ───────────────────
    matchedVolunteers: [
      {
        volunteer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        score: Number,
        breakdown: {
          skillScore: Number,
          distanceScore: Number,
          availabilityScore: Number,
          reliabilityScore: Number,
        },
      },
    ],

    // ── Completion Data ─────────────────────
    completedAt: Date,
    verifiedAt: Date,
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ─────────────────────────────────────

// Geospatial index for location-based task search
taskSchema.index({ 'location': '2dsphere' });

// Compound index for filtering tasks
taskSchema.index({ status: 1, urgency: 1 });

// Index for deadline-based sorting
taskSchema.index({ deadline: 1 });

// Index for creator lookup
taskSchema.index({ createdBy: 1 });

// ── Virtual: Check if task is overdue ───────────

taskSchema.virtual('isOverdue').get(function () {
  return this.deadline < new Date() && this.status !== 'completed' && this.status !== 'verified';
});

// ── Virtual: Volunteer count ────────────────────

taskSchema.virtual('volunteerCount').get(function () {
  return this.assignedVolunteers ? this.assignedVolunteers.length : 0;
});

// ── Pre-save: Auto-calculate points reward based on urgency ──

taskSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('urgency')) {
    const urgencyPoints = {
      low: 10,
      medium: 20,
      high: 40,
      critical: 80,
    };
    this.pointsReward = urgencyPoints[this.urgency] || 10;
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
