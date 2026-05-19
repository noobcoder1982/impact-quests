const User = require('../models/User');
const NgoVerification = require('../models/NgoVerification');
const Task = require('../models/Task');
const AuditLog = require('../models/AuditLog');
const { successResponse, errorResponse } = require('../utils/response.util');
const { callAI } = require('../utils/ai.util');

/**
 * Admin Controller — Full Command Center
 * Handles NGO verification, volunteer moderation, analytics, AI analysis, audit logs
 */

const SUPER_ADMIN_EMAIL = 'abhijeetpanda21@gmail.com';

// ── Admin Middleware ────────────────────────────

const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) return errorResponse(res, 401, 'Not authorized');
    if (!req.user.isAdmin && req.user.email !== SUPER_ADMIN_EMAIL) {
      return errorResponse(res, 403, 'Admin access required');
    }
    next();
  } catch (error) {
    return errorResponse(res, 500, 'Admin authorization error');
  }
};

// ── Audit Logger Helper ─────────────────────────

const logAction = async (req, action, details = '', targetUser = null, entityType = null, targetEntity = null, metadata = {}) => {
  try {
    await AuditLog.create({
      action,
      performedBy: req.user._id,
      targetUser,
      targetEntity,
      entityType,
      details,
      metadata,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};

// ══════════════════════════════════════════════════
//  NGO VERIFICATION
// ══════════════════════════════════════════════════

const submitVerification = async (req, res, next) => {
  try {
    const { answers, contactPhone } = req.body;
    const user = req.user;

    if (user.role !== 'ngo') {
      return errorResponse(res, 403, 'Only NGO accounts can submit verification');
    }

    const existing = await NgoVerification.findOne({
      userId: user._id,
      status: { $in: ['pending', 'under_review', 'approved'] }
    });

    if (existing) {
      return errorResponse(res, 400, 'You already have a verification request. Current status: ' + existing.status);
    }

    const verification = await NgoVerification.create({
      userId: user._id,
      organizationName: user.organizationName || user.name,
      contactEmail: user.email,
      contactPhone: contactPhone || '',
      answers: answers,
    });

    await User.findByIdAndUpdate(user._id, { ngoVerificationStatus: 'pending' });

    return successResponse(res, 201, 'Verification request submitted successfully', { verification });
  } catch (error) {
    next(error);
  }
};

const getMyVerificationStatus = async (req, res, next) => {
  try {
    const verification = await NgoVerification.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Verification status retrieved', {
      verification: verification || null,
      status: verification ? verification.status : 'none',
    });
  } catch (error) {
    next(error);
  }
};

const getAllTickets = async (req, res, next) => {
  try {
    const { status, search, sort } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { organizationName: { $regex: search, $options: 'i' } },
        { contactEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    const tickets = await NgoVerification.find(filter)
      .populate('userId', 'name email organizationName role pfp createdAt trustScore')
      .populate('reviewedBy', 'name email')
      .sort(sortOrder);

    return successResponse(res, 200, 'Tickets retrieved', { tickets });
  } catch (error) {
    next(error);
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const ticket = await NgoVerification.findById(req.params.id)
      .populate('userId', 'name email organizationName role pfp createdAt isNgoVerified trustScore')
      .populate('reviewedBy', 'name email');

    if (!ticket) return errorResponse(res, 404, 'Ticket not found');
    return successResponse(res, 200, 'Ticket retrieved', { ticket });
  } catch (error) {
    next(error);
  }
};

const reviewTicket = async (req, res, next) => {
  try {
    const { action, adminNotes } = req.body;

    if (!['approve', 'reject', 'under_review', 'suspend'].includes(action)) {
      return errorResponse(res, 400, 'Invalid action');
    }

    const ticket = await NgoVerification.findById(req.params.id);
    if (!ticket) return errorResponse(res, 404, 'Ticket not found');

    const statusMap = { approve: 'approved', reject: 'rejected', under_review: 'under_review', suspend: 'rejected' };
    ticket.status = statusMap[action];
    ticket.adminNotes = adminNotes || ticket.adminNotes;
    ticket.reviewedBy = req.user._id;
    ticket.reviewedAt = new Date();
    await ticket.save();

    const userUpdate = { ngoVerificationStatus: statusMap[action] };
    if (action === 'approve') {
      userUpdate.isNgoVerified = true;
      userUpdate.verified = true;
    } else if (action === 'reject' || action === 'suspend') {
      userUpdate.isNgoVerified = false;
    }

    await User.findByIdAndUpdate(ticket.userId, userUpdate);

    await logAction(req, `ngo_${action === 'under_review' ? 'review' : action}d` === 'ngo_reviewd' ? 'ngo_review' : `ngo_${action}d`,
      `${action} NGO: ${ticket.organizationName}`, ticket.userId, 'ngo_ticket', ticket._id.toString());

    return successResponse(res, 200, `Ticket ${action}d successfully`, { ticket });
  } catch (error) {
    next(error);
  }
};

// ── AI NGO Analysis ─────────────────────────────

const analyzeNgo = async (req, res, next) => {
  try {
    const ticket = await NgoVerification.findById(req.params.id)
      .populate('userId', 'name email organizationName createdAt');

    if (!ticket) return errorResponse(res, 404, 'Ticket not found');

    const prompt = `You are an AI fraud detection system for a humanitarian volunteer platform called ImpactQuest.

Analyze this NGO verification request and return a JSON object with your analysis:

Organization: ${ticket.organizationName}
Email: ${ticket.contactEmail}
Phone: ${ticket.contactPhone || 'Not provided'}
Account Created: ${ticket.userId?.createdAt || 'Unknown'}
Submitted: ${ticket.createdAt}

Verification Answers:
${Object.entries(ticket.answers || {}).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

Return ONLY this JSON structure:
{
  "riskScore": <0-100, where 100 is highest risk>,
  "riskLevel": "<low|medium|high|critical>",
  "documentAuthenticity": "<appears_authentic|suspicious|cannot_verify>",
  "scamProbability": <0-100>,
  "duplicateDetection": "<none_detected|possible_duplicate|confirmed_duplicate>",
  "suspiciousPatterns": ["<list of any suspicious patterns found>"],
  "positiveSignals": ["<list of positive trust signals>"],
  "summary": "<2-3 sentence analysis summary>",
  "recommendation": "<approve|review_further|reject>"
}`;

    let analysis;
    try {
      analysis = await callAI(prompt, "meta/llama-3.1-8b-instruct", 0.1, 1024);
    } catch (aiErr) {
      // Fallback if AI is unavailable
      analysis = {
        riskScore: 25,
        riskLevel: 'low',
        documentAuthenticity: 'cannot_verify',
        scamProbability: 15,
        duplicateDetection: 'none_detected',
        suspiciousPatterns: [],
        positiveSignals: ['Provided contact details', 'Complete answers'],
        summary: 'AI analysis temporarily unavailable. Manual review recommended.',
        recommendation: 'review_further',
      };
    }

    // Store analysis on the ticket
    ticket.aiAnalysis = analysis;
    ticket.aiAnalyzedAt = new Date();
    await ticket.save();

    return successResponse(res, 200, 'AI analysis complete', { analysis });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════
//  VOLUNTEER MANAGEMENT
// ══════════════════════════════════════════════════

const getVolunteers = async (req, res, next) => {
  try {
    const { search, sort, status, page = 1, limit = 50 } = req.query;
    const filter = { role: 'volunteer' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { nickname: { $regex: search, $options: 'i' } },
      ];
    }

    if (status === 'suspended') filter.isSuspended = true;
    if (status === 'active') filter.isSuspended = { $ne: true };

    let sortOrder = { createdAt: -1 };
    if (sort === 'points') sortOrder = { points: -1 };
    if (sort === 'trust') sortOrder = { trustScore: -1 };
    if (sort === 'name') sortOrder = { name: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);
    const volunteers = await User.find(filter)
      .select('name email pfp role points level trustScore reliabilityScore tasksCompleted createdAt isSuspended isOnboarded currentStreak')
      .sort(sortOrder)
      .skip(skip)
      .limit(parseInt(limit));

    return successResponse(res, 200, 'Volunteers retrieved', {
      volunteers,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

const suspendVolunteer = async (req, res, next) => {
  try {
    const { userId, reason } = req.body;
    const user = await User.findById(userId);
    if (!user) return errorResponse(res, 404, 'User not found');

    user.isSuspended = true;
    user.suspensionReason = reason || 'Suspended by admin';
    user.suspendedAt = new Date();
    user.suspendedBy = req.user._id;
    await user.save({ validateBeforeSave: false });

    await logAction(req, 'volunteer_suspended', `Suspended: ${user.name} (${user.email}). Reason: ${reason}`, userId, 'user', userId);

    return successResponse(res, 200, 'Volunteer suspended', { user: { _id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
};

const unsuspendVolunteer = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return errorResponse(res, 404, 'User not found');

    user.isSuspended = false;
    user.suspensionReason = '';
    await user.save({ validateBeforeSave: false });

    await logAction(req, 'volunteer_unsuspended', `Unsuspended: ${user.name}`, userId, 'user', userId);

    return successResponse(res, 200, 'Volunteer unsuspended');
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════
//  EXTENDED STATISTICS
// ══════════════════════════════════════════════════

const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers, totalNgos, totalVolunteers,
      pendingTickets, approvedNgos, rejectedTickets,
      totalTasks, activeTasks,
      suspendedUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'ngo' }),
      User.countDocuments({ role: 'volunteer' }),
      NgoVerification.countDocuments({ status: 'pending' }),
      User.countDocuments({ isNgoVerified: true }),
      NgoVerification.countDocuments({ status: 'rejected' }),
      Task.countDocuments(),
      Task.countDocuments({ status: { $in: ['Open', 'In Progress'] } }),
      User.countDocuments({ isSuspended: true }),
    ]);

    // Volunteer growth (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentVolunteers = await User.countDocuments({ role: 'volunteer', createdAt: { $gte: sevenDaysAgo } });

    // Monthly growth data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          volunteers: { $sum: { $cond: [{ $eq: ["$role", "volunteer"] }, 1, 0] } },
          ngos: { $sum: { $cond: [{ $eq: ["$role", "ngo"] }, 1, 0] } },
          total: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // NGO approval trends (last 6 months)
    const ngoTrends = await NgoVerification.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
          total: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return successResponse(res, 200, 'Extended stats retrieved', {
      stats: {
        totalUsers, totalNgos, totalVolunteers,
        pendingTickets, approvedNgos, rejectedTickets,
        totalTasks, activeTasks,
        suspendedUsers,
        recentVolunteers,
        aiFlaggedActivities: 0, // Placeholder for Phase 3
        emergencyMissions: activeTasks,
        totalDonations: 0, // Placeholder
        reportsFiled: 0, // Placeholder
      },
      charts: {
        monthlyGrowth,
        ngoTrends,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════
//  ACTIVITY FEED
// ══════════════════════════════════════════════════

const getActivityFeed = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    const logs = await AuditLog.find()
      .populate('performedBy', 'name email pfp')
      .populate('targetUser', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Also get recent verifications as activity
    const recentVerifications = await NgoVerification.find()
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ updatedAt: -1 })
      .limit(10);

    const feed = [
      ...logs.map(l => ({
        id: l._id,
        type: 'audit',
        action: l.action,
        details: l.details,
        performer: l.performedBy,
        target: l.targetUser,
        timestamp: l.createdAt,
      })),
      ...recentVerifications.map(v => ({
        id: v._id,
        type: 'verification',
        action: v.status === 'approved' ? 'ngo_approved' : v.status === 'rejected' ? 'ngo_rejected' : 'ngo_submitted',
        details: `NGO "${v.organizationName}" — ${v.status}`,
        performer: v.reviewedBy || v.userId,
        timestamp: v.updatedAt,
      })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, parseInt(limit));

    return successResponse(res, 200, 'Activity feed retrieved', { feed });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════
//  AUDIT LOGS
// ══════════════════════════════════════════════════

const getAuditLogs = async (req, res, next) => {
  try {
    const { action, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (action && action !== 'all') filter.action = action;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .populate('performedBy', 'name email pfp')
      .populate('targetUser', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return successResponse(res, 200, 'Audit logs retrieved', {
      logs,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════
//  ADMIN MANAGEMENT
// ══════════════════════════════════════════════════

const listAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({
      $or: [{ isAdmin: true }, { email: SUPER_ADMIN_EMAIL }]
    }).select('name email isAdmin pfp role createdAt');

    return successResponse(res, 200, 'Admins retrieved', { admins });
  } catch (error) {
    next(error);
  }
};

const addAdmin = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, 400, 'Email is required');

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return errorResponse(res, 404, 'No user found with that email');
    if (user.isAdmin) return errorResponse(res, 400, 'User is already an admin');

    user.isAdmin = true;
    await user.save({ validateBeforeSave: false });

    await logAction(req, 'admin_added', `Added admin: ${user.email}`, user._id, 'user', user._id.toString());

    return successResponse(res, 200, 'Admin added successfully', {
      admin: { name: user.name, email: user.email, _id: user._id },
    });
  } catch (error) {
    next(error);
  }
};

const removeAdmin = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (email === SUPER_ADMIN_EMAIL) return errorResponse(res, 403, 'Cannot remove super admin');

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return errorResponse(res, 404, 'No user found with that email');

    user.isAdmin = false;
    await user.save({ validateBeforeSave: false });

    await logAction(req, 'admin_removed', `Removed admin: ${user.email}`, user._id, 'user', user._id.toString());

    return successResponse(res, 200, 'Admin removed successfully');
  } catch (error) {
    next(error);
  }
};

const checkAdmin = async (req, res, next) => {
  try {
    const isAdminUser = req.user.isAdmin || req.user.email === SUPER_ADMIN_EMAIL;
    return successResponse(res, 200, 'Admin check', { isAdmin: isAdminUser });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  isAdmin,
  submitVerification,
  getMyVerificationStatus,
  getAllTickets,
  getTicketById,
  reviewTicket,
  analyzeNgo,
  getVolunteers,
  suspendVolunteer,
  unsuspendVolunteer,
  getAdminStats,
  getActivityFeed,
  getAuditLogs,
  listAdmins,
  addAdmin,
  removeAdmin,
  checkAdmin,
};
