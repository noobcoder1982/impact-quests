const jwt = require('jsonwebtoken');
const User = require('../models/User');
const admin = require('../config/firebase');

/**
 * Protect routes - Verify JWT or Firebase token
 * Extracts token from Authorization header (Bearer <token>)
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. No token provided.',
      });
    }

    // Allow guest tokens in development/local mode
    if ((token === 'guest-token-123' || token === 'guest-token-ngo' || token === 'guest-token-admin') && process.env.NODE_ENV !== 'production') {
      let email = 'guest@impactquest.org';
      let name = 'Guest Volunteer';
      let role = 'volunteer';
      let isAdmin = false;

      if (token === 'guest-token-ngo') {
        email = 'testngo@impactquest.org';
        name = 'Test NGO Admin';
        role = 'ngo';
      } else if (token === 'guest-token-admin') {
        email = 'abhijeetpanda21@gmail.com';
        name = 'Admin User';
        role = 'volunteer';
        isAdmin = true;
      }

      let guestUser = await User.findOne({ email });
      
      if (!guestUser) {
        guestUser = await User.create({
          name,
          email,
          role,
          isAdmin,
          isOnboarded: true,
          firebaseUid: `guest-uid-${role}-${isAdmin ? 'admin' : 'user'}`,
        });
      } else {
        // Keep role and admin status synced in local db
        let updated = false;
        if (guestUser.role !== role) { guestUser.role = role; updated = true; }
        if (guestUser.isAdmin !== isAdmin) { guestUser.isAdmin = isAdmin; updated = true; }
        if (updated) { await guestUser.save(); }
      }
      
      req.user = guestUser;
      return next();
    }

    let decoded;
    let user;

    // Try verifying as a standard JWT first
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = await User.findById(decoded.id);
    } catch (jwtError) {
      // If standard JWT fails, try Firebase verification
      try {
        const decodedFirebaseToken = await admin.auth().verifyIdToken(token);
        user = await User.findOne({ 
          $or: [
            { firebaseUid: decodedFirebaseToken.uid },
            { email: decodedFirebaseToken.email }
          ]
        });
      } catch (firebaseError) {
        // If both fail, return invalid token error
        if (jwtError.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Token has expired. Please login again.',
          });
        }
        return res.status(401).json({
          success: false,
          message: 'Invalid token.',
        });
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error.',
    });
  }
};

/**
 * Role-Based Access Control (RBAC)
 * Restricts access to specific roles
 * Usage: authorize('ngo') or authorize('volunteer', 'ngo')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
