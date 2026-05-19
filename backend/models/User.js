const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Supports two roles: 'volunteer' and 'ngo'
 * Volunteer-specific fields: skills, availability, points, level, badges, reliabilityScore
 * NGO-specific fields: organizationName, verified
 */
const userSchema = new mongoose.Schema(
  {
    // ── Common Fields ─────────────────────────
    role: {
      type: String,
      enum: ['volunteer', 'ngo', 'customer'],
      required: [true, 'Role is required'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      // Password is not required if logging in via Firebase Google Sign-In
      required: false,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },

    // ── Onboarding & Identity ────────────────
    nickname: {
      type: String,
      trim: true,
      default: '',
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    selectedSkills: {
      type: [String],
      default: [],
    },

    // ── Volunteer-Specific Fields ─────────────
    skills: {
      type: [String],
      default: [],
    },
    
    // ── Specific Stats (Empty by default) ─────
    impactQuotient: {
      type: Number,
      default: 0,
    },
    activeDirectories: {
      type: Number,
      default: 0,
    },
    activityProtocol: {
      type: String,
      default: 'Standby',
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude] — GeoJSON format
        default: [0, 0],
      },
    },
    availability: [
      {
        day: {
          type: String,
          enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        },
        startTime: String, // "09:00"
        endTime: String,   // "17:00"
      },
    ],
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    badges: [
      {
        name: String,
        description: String,
        awardedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reliabilityScore: {
      type: Number,
      default: 0, // Reset to 0
      min: 0,
      max: 100,
    },
    tasksCompleted: {
      type: Number,
      default: 0,
    },
    recentImpact: [
      {
        id: String,
        label: String,
        xp: Number,
        time: String,
      }
    ],
    achievements: [
      {
        id: String,
        label: String,
        date: String,
        icon: String,
      }
    ],
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },

    // ── Energy & Burnout Tracking ────────────
    energy: {
      current: {
        type: Number,
        default: 100,
        min: 0,
        max: 100
      },
      max: {
        type: Number,
        default: 100
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      },
      history: [{
        value: Number,
        timestamp: {
          type: Date,
          default: Date.now
        },
        reason: String
      }]
    },
    burnoutScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    focusScore: {
      type: Number,
      default: 75,
      min: 0,
      max: 100
    },
    workloadCapacity: {
      type: Number,
      default: 5
    }, // tasks per day
    activityPatterns: {
      averageTasksPerDay: {
        type: Number,
        default: 0
      },
      averageWorkHours: {
        type: Number,
        default: 0
      },
      peakProductivityHours: [Number],
      restDays: [String],
      lastActive: Date
    },
    trustScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    }, // For anti-abuse

    // ── UI Preferences ──────────────────────
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark',
    },
    themeVariant: {
      type: String,
      enum: ['standard', 'mono', 'graphite', 'slate', 'onyx'],
      default: 'standard',
    },
    pfp: {
      type: String,
      default: '',
    },
    banner: {
      type: String,
      default: '',
    },
    organizationName: {
      type: String,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },

    // ── Admin & NGO Verification ──────────────
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isNgoVerified: {
      type: Boolean,
      default: false,
    },
    ngoVerificationStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none',
    },

    // ── Refresh Token ─────────────────────────
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt (timezone-aware)
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ─────────────────────────────────────

// Geospatial index for location-based queries
userSchema.index({ 'location': '2dsphere' });

// Index for leaderboard queries
userSchema.index({ points: -1 });

// Index for skill-based matching
userSchema.index({ skills: 1 });

// Index for role-based filtering
userSchema.index({ role: 1 });

// ── Pre-Save Hook: Hash Password ────────────────

userSchema.pre('save', async function () {
  // Only hash the password if it has been modified
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// ── Instance Methods ────────────────────────────

/**
 * Compare entered password with hashed password
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Calculate level based on points
 * Level thresholds: 0-99 = L1, 100-299 = L2, 300-599 = L3, 600-999 = L4, 1000+ = L5
 */
userSchema.methods.calculateLevel = function () {
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000];
  let level = 1;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (this.points >= thresholds[i]) {
      level = i + 1;
      break;
    }
  }
  this.level = level;
  return level;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
