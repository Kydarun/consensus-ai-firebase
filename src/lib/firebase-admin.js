// lib/firebase-admin.js
import * as admin from 'firebase-admin';

// Ensure Firebase Admin SDK is initialized only once
if (!admin.apps.length) {
  try {
     const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
     console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
     console.error('Firebase Admin SDK initialization error:', error.stack);
     // Throw error or handle appropriately depending on your error handling strategy
     // process.exit(1); // Exit if critical for server operation
  }
}

export const auth = admin.auth;
export const firestore = admin.firestore;
export default admin;
