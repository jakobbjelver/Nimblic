const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173', // Replace with your localhost port if different
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.setDefaultUserValues = functions.firestore
  .document('users/{userId}')
  .onCreate((snap, context) => {
    // Default values
    const defaultValues = {
      uploadLimit: 5,
      fileSizeLimit: 10,
      accountType: 'Free',
      lastUploads: [],
      chatCredit: 10
    };

    return snap.ref.set(defaultValues, { merge: true });
  });
  
exports.storeAnalysisData = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const uid = context.auth.uid;
  const uploadData = data.uploadData;
  const analysisId = data.analysisId;

  if (!uploadData) {
    console.log("No data provided");
    return { success: false, message: "No data provided" };
  }

  try {
    const analysisDocRef = admin.firestore().doc(`users/${uid}/analyses/${analysisId}`);

    await analysisDocRef.set(uploadData, { merge: true });
    return { success: true, message: "Data stored successfully" };
  } catch (error) {
    console.error("Failed to store analysis.", error);
    throw new functions.https.HttpsError('internal', 'Failed to store analysis data.');
  }
});


exports.processMessage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const uid = context.auth.uid;
  const prompt = data.prompt;
  const discussionId = data.discussionId;

  const requestType = prompt.requestType
  const analysisId = prompt.analysisId
  const topic = prompt.topic
  const userText = prompt.userText
  const skillLevel = prompt.skillLevel

  const text = JSON.stringify({
    userText,
    requestType,
    skillLevel
  })

  const userRef = admin.firestore().collection('users').doc(uid);
  let messageId;

  await admin.firestore().runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    let chatCredit = 10; // Default chat credits

    if (userDoc.exists) {
      const userData = userDoc.data();
      chatCredit = userData.chatCredit !== undefined ? userData.chatCredit : chatCredit;
    }

    if (chatCredit <= 0) {
      throw new functions.https.HttpsError('resource-exhausted', 'No chat credits left.');
    }

    // Decrement chat credit
    transaction.set(userRef, { chatCredit: admin.firestore.FieldValue.increment(-1) }, { merge: true });

    // Add new message to the user's discussion
    const messagesRef = admin.firestore().collection(`users/${uid}/discussions/${discussionId}/messages`);
    const newMessageRef = messagesRef.doc();
    messageId = newMessageRef.id;
    transaction.set(newMessageRef, {
      prompt: text,
      topic: topic,
      analysisId: analysisId,
      requestType: requestType,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Delete previous follow-up questions if the current request is for a follow-up question
    if (requestType === 'followUpQuestions') {
      const querySnapshot = await messagesRef.where('requestType', '==', 'followUpQuestions').get();
      querySnapshot.forEach(doc => {
        if (doc.id !== messageId) {
          transaction.delete(doc.ref);
        }
      });
    }
  });

  return { messageId: messageId };
});

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

