const mongoose = require('mongoose');

/**
 * AuditLog Schema
 * Tracks all admin actions for accountability
 */
const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'ngo_approved', 'ngo_rejected', 'ngo_review',
      'volunteer_suspended', 'volunteer_unsuspended', 'volunteer_banned',
      'admin_added', 'admin_removed',
      'campaign_approved', 'campaign_rejected', 'campaign_frozen',
      'report_resolved', 'report_dismissed',
      'settings_changed', 'login', 'logout',
      'ai_flag_resolved', 'ai_flag_dismissed',
    ],
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  targetEntity: {
    type: String, // ID of the entity (ticket, campaign, etc.)
  },
  entityType: {
    type: String,
    enum: ['user', 'ngo_ticket', 'campaign', 'report', 'settings'],
  },
  details: {
    type: String,
    default: '',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ipAddress: String,
  userAgent: String,
}, {
  timestamps: true,
});

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ action: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
