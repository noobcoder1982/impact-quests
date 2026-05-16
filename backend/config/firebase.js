const admin = require('firebase-admin');
const path = require('path');

try {
  let serviceAccount;
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Fallback for local development
    try {
      serviceAccount = require('../service-account.json');
    } catch (e) {
      console.warn('Firebase Service Account file not found. Set FIREBASE_SERVICE_ACCOUNT env var for production.');
    }
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully');
  }
} catch (error) {
  console.error('Firebase Admin SDK initialization error:', error);
}

module.exports = admin;
