/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

/*

exports.updateUserAccountType = functions.https.onCall((data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { uid, accountType } = data;

  // Validate input data
  if (!uid || !accountType) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with valid user ID and account type.');
  }

  // Define limits based on account type
  const limits = getAccountLimits(accountType);

  // Update user data in Firestore
  const userRef = admin.firestore().collection('users').doc(uid);
  return userRef.update({
    accountType: accountType,
    ...limits
  }).then(() => {
    console.log(`Updated user ${uid} with account type ${accountType}`);
    return { result: `User ${uid} updated successfully to ${accountType} account.` };
  }).catch(error => {
    console.error("Error updating user:", error);
    throw new functions.https.HttpsError('unknown', 'An error occurred while updating the user.');
  });
});

function getAccountLimits(accountType) {
  switch (accountType) {
    case 'Premium':
      return { uploadLimit: 20, fileSizeLimit: 15 };
    case 'Ultimate':
      return { uploadLimit: 50, fileSizeLimit: 30 };
    default: // Regular account
      return { uploadLimit: 10, fileSizeLimit: 5 };
  }
}

*/

exports.setDefaultUserValues = functions.firestore
    .document('users/{userId}')
    .onCreate((snap, context) => {
        // Default values
        const defaultValues = {
            uploadLimit: 5,
            fileSizeLimit: 10,
            accountType: 'Free',
            lastUploads: []
        };

        return snap.ref.set(defaultValues, { merge: true });
    });

