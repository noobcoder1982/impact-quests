const mongoose = require('mongoose');

/**
 * NGO Verification Schema
 * Stores verification requests (tickets) from NGOs for admin review
 */
const ngoVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizationName: {
      type: String,
      required: true,
      trim: true,
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    // Verification Questions & Answers
    answers: {
      missionStatement: {
        type: String,
        required: true,
      },
      registrationNumber: {
        type: String,
        default: '',
      },
      yearsActive: {
        type: String,
        default: '',
      },
      teamSize: {
        type: String,
        default: '',
      },
      website: {
        type: String,
        default: '',
      },
      areasOfOperation: {
        type: String,
        default: '',
      },
      proofDescription: {
        type: String,
        default: '',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for quick lookups
ngoVerificationSchema.index({ status: 1 });
ngoVerificationSchema.index({ userId: 1 });

const NgoVerification = mongoose.model('NgoVerification', ngoVerificationSchema);

module.exports = NgoVerification;
