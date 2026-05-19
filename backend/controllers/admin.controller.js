const User = require('../models/User');
const NgoVerification = require('../models/NgoVerification');
const { successResponse, errorResponse } = require('../utils/response.util');

/**
 * Admin Controller
 * Handles NGO verification tickets and admin management
 */

// ── Admin Middleware ────────────────────────────

/**
 * Check if current user is an admin
 */
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, 'Not authorized');
    }

    // Check if user is admin by flag OR by email
    const SUPER_ADMIN_EMAIL = 'abhijeetpanda21@gmail.com';
    if (!req.user.isAdmin && req.user.email !== SUPER_ADMIN_EMAIL) {
      return errorResponse(res, 403, 'Admin access required');
    }

    next();
  } catch (error) {
    return errorResponse(res, 500, 'Admin authorization error');
  }
};

// ── NGO Verification Endpoints ──────────────────

/**
 * @route   POST /api/v1/admin/ngo-verify/submit
 * @desc    NGO submits verification request (called by NGO user)
 * @access  Private (NGO only)
 */
const submitVerification = async (req, res, next) => {
  try {
    const { answers, contactPhone } = req.body;
    const user = req.user;

    if (user.role !== 'ngo') {
      return errorResponse(res, 403, 'Only NGO accounts can submit verification');
    }

    // Check if already has a pending/approved verification
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

    // Update user's verification status
    await User.findByIdAndUpdate(user._id, { ngoVerificationStatus: 'pending' });

    return successResponse(res, 201, 'Verification request submitted successfully', { verification });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/admin/ngo-verify/my-status
 * @desc    NGO checks their verification status
 * @access  Private (NGO only)
 */
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

/**
 * @route   GET /api/v1/admin/tickets
 * @desc    Get all NGO verification tickets (admin only)
 * @access  Private (Admin)
 */
const getAllTickets = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const tickets = await NgoVerification.find(filter)
      .populate('userId', 'name email organizationName role pfp createdAt')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Tickets retrieved', { tickets });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/admin/tickets/:id
 * @desc    Get a single ticket by ID
 * @access  Private (Admin)
 */
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await NgoVerification.findById(req.params.id)
      .populate('userId', 'name email organizationName role pfp createdAt isNgoVerified')
      .populate('reviewedBy', 'name email');

    if (!ticket) {
      return errorResponse(res, 404, 'Ticket not found');
    }

    return successResponse(res, 200, 'Ticket retrieved', { ticket });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/v1/admin/tickets/:id/review
 * @desc    Approve or reject an NGO verification ticket
 * @access  Private (Admin)
 */
const reviewTicket = async (req, res, next) => {
  try {
    const { action, adminNotes } = req.body;

    if (!['approve', 'reject', 'under_review'].includes(action)) {
      return errorResponse(res, 400, 'Invalid action. Must be approve, reject, or under_review');
    }

    const ticket = await NgoVerification.findById(req.params.id);
    if (!ticket) {
      return errorResponse(res, 404, 'Ticket not found');
    }

    // Map action to status
    const statusMap = {
      'approve': 'approved',
      'reject': 'rejected',
      'under_review': 'under_review',
    };

    ticket.status = statusMap[action];
    ticket.adminNotes = adminNotes || ticket.adminNotes;
    ticket.reviewedBy = req.user._id;
    ticket.reviewedAt = new Date();
    await ticket.save();

    // Update user's verification status
    const userUpdate = { ngoVerificationStatus: statusMap[action] };
    if (action === 'approve') {
      userUpdate.isNgoVerified = true;
      userUpdate.verified = true;
    } else if (action === 'reject') {
      userUpdate.isNgoVerified = false;
    }

    await User.findByIdAndUpdate(ticket.userId, userUpdate);

    return successResponse(res, 200, `Ticket ${action}d successfully`, { ticket });
  } catch (error) {
    next(error);
  }
};

// ── Admin Management ────────────────────────────

/**
 * @route   GET /api/v1/admin/admins
 * @desc    List all admins
 * @access  Private (Admin)
 */
const listAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ 
      $or: [
        { isAdmin: true },
        { email: 'abhijeetpanda21@gmail.com' }
      ]
    }).select('name email isAdmin pfp role createdAt');

    return successResponse(res, 200, 'Admins retrieved', { admins });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/admin/admins/add
 * @desc    Add a user as admin by email
 * @access  Private (Admin)
 */
const addAdmin = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 400, 'Email is required');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return errorResponse(res, 404, 'No user found with that email');
    }

    if (user.isAdmin) {
      return errorResponse(res, 400, 'User is already an admin');
    }

    user.isAdmin = true;
    await user.save({ validateBeforeSave: false });

    return successResponse(res, 200, 'Admin added successfully', {
      admin: { name: user.name, email: user.email, _id: user._id },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/admin/admins/remove
 * @desc    Remove admin privileges from a user
 * @access  Private (Admin)
 */
const removeAdmin = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Can't remove super admin
    if (email === 'abhijeetpanda21@gmail.com') {
      return errorResponse(res, 403, 'Cannot remove super admin');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return errorResponse(res, 404, 'No user found with that email');
    }

    user.isAdmin = false;
    await user.save({ validateBeforeSave: false });

    return successResponse(res, 200, 'Admin removed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Get admin dashboard stats
 * @access  Private (Admin)
 */
const getAdminStats = async (req, res, next) => {
  try {
    const [totalUsers, totalNgos, pendingTickets, approvedNgos, rejectedTickets] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'ngo' }),
      NgoVerification.countDocuments({ status: 'pending' }),
      User.countDocuments({ isNgoVerified: true }),
      NgoVerification.countDocuments({ status: 'rejected' }),
    ]);

    return successResponse(res, 200, 'Stats retrieved', {
      stats: { totalUsers, totalNgos, pendingTickets, approvedNgos, rejectedTickets },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/admin/check
 * @desc    Check if current user has admin access
 * @access  Private
 */
const checkAdmin = async (req, res, next) => {
  try {
    const SUPER_ADMIN_EMAIL = 'abhijeetpanda21@gmail.com';
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
  listAdmins,
  addAdmin,
  removeAdmin,
  getAdminStats,
  checkAdmin,
};
