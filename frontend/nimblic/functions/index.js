/*
const express = require("express");
const app = express();
require('dotenv').config();

const cors = require('cors');
app.use(
  cors({
    origin: "*",
  })
);
*/

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { FieldValue } = require("firebase-admin/firestore");
const exampleMetaResponse = require('./example_meta_response.json');

admin.initializeApp();

const { VertexAI, HarmCategory, HarmBlockThreshold } = require('@google-cloud/vertexai');
const db = admin.firestore();

// Access environment variables
const project = process.env.PROJECT_ID;
const location = process.env.LOCATION;
const _context = process.env.CONTEXT;
const context_meta = process.env.CONTEXT_META;
const top_k = parseInt(process.env.TOP_K);
const top_p = parseFloat(process.env.TOP_P);
const temperature = parseFloat(process.env.TEMPERATURE);
const max_input_tokens = parseInt(process.env.MAX_INPUT_TOKENS);

const vertexAI = new VertexAI({ project: project, location: location });

const generativeModel = vertexAI.preview.getGenerativeModel({
  model: 'gemini-pro',
});

exports.sendChat = functions.https.onCall(async (data, context) => {
  console.log(`Project ID: ${project}, Location: ${location}`);

  // Fetch recent chat history
  const recentChats = await fetchRecentChats(data.analysisId);
  const history = [
    {
      role: 'user',
      parts: [{ text: `System prompt: ${_context}` }], // Static instruction
    },
    {
      role: 'model',
      parts: [{ text: 'Understood' }], // Static instruction
    },
    ...recentChats.flatMap(chat => [
      {
        role: 'user',
        parts: [{ text: chat.prompt }],
      },
      {
        role: 'model',
        parts: [{ text: chat.response }],
      }
    ])
  ];

  console.log("SETTING HISTORY: ", JSON.stringify(history))

  // Instantiate the model and start a chat session with history
  const model = vertexAI.preview.getGenerativeModel({
    model: 'gemini-pro',
  });

  const chat = model.startChat(
    {
      history: history
    }
  );

  const { userText, skillLevel, analysisId, topic } = data;
  const userId = context.auth.uid;

  const analysisData = await fetchAnalysisData(userId, analysisId, topic);
  const rawAnalysisString = JSON.stringify(analysisData)
  const analysisString = rawAnalysisString.replace(/"/g, '');

  const prompt = `${userText}. My skill level is: ${skillLevel}. This is the provided analysis data that I am referring to, and which you should base your response upon: ${analysisString}`;

  const userRef = db.collection('users').doc(userId);
  const discussionRef = userRef.collection('discussions').doc(analysisId);
  const messageRef = discussionRef.collection('messages').doc();
  await messageRef.set({
    topic,
    prompt: userText,
    timestamp: FieldValue.serverTimestamp(),
    response: "",
    status: { state: "SENDING", error: null, finishTime: null }
  });

  try {
    await subtractUserCredits(userRef);

    //await countTokens(prompt)

    // Send the message to the model and log the response
    console.log(`Sending message to Vertex AI: ${prompt}`);
    const result = await chat.sendMessageStream(prompt);

    // Initialize an empty array to accumulate responses
    const accumulatedResponses = [];

    for await (const item of result.stream) {
      console.log(`Received response part:`, item);
      const responseText = item.candidates[0].content.parts.map(part => part.text).join("");

      // Append the new response to the accumulatedResponses array
      accumulatedResponses.push(responseText);

      // Update the messageRef with the accumulatedResponses array
      await messageRef.update({
        response: accumulatedResponses, // Update the response field with the accumulatedResponses array
        status: {
          state: "PROCESSING", // Indicate that it's still processing
          error: null,
          timestamp: FieldValue.serverTimestamp(),
        }
      });
    }

    // After the loop is completed, mark it as DONE and update the messageRef
    await messageRef.update({
      status: {
        state: "DONE",
        error: null,
        timestamp: FieldValue.serverTimestamp(),
      }
    });

    // Generate follow-up questions
    const exampleMetaString = JSON.stringify(exampleMetaResponse);
    const metaPrompt = `Based on the previous response: "${accumulatedResponses.join(" ")}": ${context_meta} Take this as an example: ${exampleMetaString}`;
    try {
      console.log("SENDING META PROMPT: ", metaPrompt)

      const metaResult = await model.generateContent(metaPrompt);
      const metaResponse = await metaResult.response;

      const metaText = metaResponse.candidates[0].content.parts[0].text

      console.log("META TEXT: ", metaText)

      const jsonResponse = JSON.parse(metaText.replace(/`/g, ''));
      // Extract information from jsonResponse
      const { glossary, actionableSteps, resources, followUpQuestions } = jsonResponse;


      console.log("JSON RESPONSE: ", jsonResponse)

      // Update Firestore document with follow-up questions
      await messageRef.update({
        glossary,
        actionableSteps,
        resources,
        followUpQuestions,
      });

    } catch (error) {
      console.error('Error generating meta data with Vertex AI:', error);
      //throw new functions.https.HttpsError('internal', 'Failed to generate content', error.message);
    }

    return;

  } catch (error) {
    console.error('Error communicating with Vertex AI:', error);
    const errorMessage = { code: error.code || error.message, details: error.message };
    await messageRef.update({
      status: {
        state: "ERROR",
        error: errorMessage,
        finishTime: FieldValue.serverTimestamp(),
      }
    });
    throw new functions.https.HttpsError('internal', 'Failed to generate content', errorMessage);
  }
});

async function subtractUserCredits(userRef) {
  const userDoc = await userRef.get();
  let chatCredit = 10; // Default chat credits if not specified

  if (userDoc.exists) {
    const userData = userDoc.data();
    chatCredit = userData.chatCredit !== undefined ? userData.chatCredit : chatCredit;
  }

  if (chatCredit <= 0) {
    throw new functions.https.HttpsError('resource-exhausted', 'No chat credits left.');
  }

  userRef.set({ chatCredit: FieldValue.increment(-1) }, { merge: true })

}

async function countTokens(request) {
  const countTokensResp = await generativeModel.countTokens(request);
  // Assuming countTokensResp returns an object with a token_count property
  console.log(`SENDING REQUEST WITH ${countTokensResp.totalTokens} TOKENS`)
  if (countTokensResp.totalTokens > max_input_tokens) {
    throw new functions.https.HttpsError('invalid-argument', `The request exceeds the token limit of ${max_input_tokens}. Please shorten your message.`);
  }

  console.log("Request with tokens: ", countTokensResp.totalTokens)
}

// Function to fetch analysis data
async function fetchAnalysisData(userId, analysisId, topic) {
  console.log(`Fetching analysis data for userId: ${userId}, analysisId: ${analysisId}, topic: ${topic}`);

  if (!userId || !analysisId || !topic) {
    console.error("One of the required parameters is null!");
    return {};
  }

  if (topic == 'metadata') {
    // Reference to the metadata document
    const metadataDocRef = db.collection(`users/${userId}/analyses`).doc(analysisId);
    const metadataSnap = await metadataDocRef.get();
    if (!metadataSnap.exists) {
      console.error('No metadatadata found for analysisId:', analysisId);
      return {};
    }
    const metadata = metadataSnap.data();
    console.log(`Metadata fetched successfully for analysisId: ${analysisId}.`);
    return metadata || {}; // Adjust this based on your data structure
  } else {
    // Reference to the analysis document for storing metadata
    const analysisDocRef = db.collection(`users/${userId}/analyses`).doc(analysisId);
    // Reference to the analysisData subcollection's document
    // Assuming the use of a static ID like "main" for simplicity
    const analysisDataDocRef = analysisDocRef.collection('data').doc('main');
    const analysisDataSnap = await analysisDataDocRef.get();
    if (!analysisDataSnap.exists) {
      console.error('No analysis data found for analysisId:', analysisId);
      return {};
    }
    const analysisData = analysisDataSnap.data();
    console.log(`Analysis data fetched successfully for analysisId: ${analysisId}.`);
    return analysisData[topic] || {}; // Adjust this based on your data structure
  }
}

// Function to fetch recent chats for a given analysisId
async function fetchRecentChats(analysisId) {
  if (!analysisId) {
    console.error("Invalid or missing analysisId");
    throw new functions.https.HttpsError('not-found', `Analysis with ID: ${analysisId} not found.`);
  }

  const discussionRef = db.collection('discussions').doc(analysisId).collection('messages');
  const snapshot = await discussionRef.orderBy('timestamp', 'desc').limit(10).get(); // Adjust limit as needed
  return snapshot.docs.map(doc => doc.data());
}

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

  const userId = context.auth.uid;
  const analysisData = data.analysisData;
  const analysisId = data.analysisId;
  const metadata = data.metadata; // Assuming metadata includes isAvailable: true initially

  // Checking if analysisData or metadata was provided in the request
  if (!analysisData || !metadata) {
    console.log("No analysis data or metadata provided");
    return { success: false, message: "No analysis data or metadata provided" };
  }

  try {
    // Reference to the analysis document for storing metadata
    const analysisDocRef = db.collection(`users/${userId}/analyses`).doc(analysisId);

    // Set the metadata in the analysis document
    await analysisDocRef.set(metadata, { merge: true });

    // Reference to the analysisData subcollection's document
    // Assuming the use of a static ID like "main" for simplicity
    const analysisDataDocRef = analysisDocRef.collection('data').doc('main');

    // Try to set the analysisData in the subcollection
    try {
      await analysisDataDocRef.set({ analysisData }, { merge: true });
    } catch (error) {
      // If the analysisData write fails, update the isAvailable field in metadata
      console.error("Failed to store analysis data. Marking as unavailable.", error);
      await analysisDocRef.update({ "status.isAvailable": false });
      throw new functions.https.HttpsError('internal', 'Failed to store analysis data. Marked as unavailable.');
    }

    return { success: true, message: "Data and metadata stored successfully" };
  } catch (error) {
    console.error("Failed to store analysis metadata.", error);
    throw new functions.https.HttpsError('internal', 'Failed to store analysis metadata.');
  }
});

exports.searchUsers = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { searchQueries, searchType } = data;
  if(searchQueries.length === 0) {
    return [];
  }
  if (!searchQueries || !Array.isArray(searchQueries)) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a non-empty array "searchQueries".');
  }
  if (!searchType || !['query', 'id'].includes(searchType)) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a valid "searchType" (query, id).');
  }

  try {
    const usersRef = db.collection('users');
    let users = [];

    for (const query of searchQueries) {
      let querySnapshot;
      if (searchType === 'id') {
        // If searchType is 'id', directly use the query as the document ID
        const docSnapshot = await usersRef.doc(query).get();
        if (docSnapshot.exists) {
          const userData = docSnapshot.data();
          users.push({
            id: docSnapshot.id,
            displayName: userData.displayName,
            email: userData.email,
            photoURL: userData.photoURL
          });
        }
      } else {
        // For query search type, search by either displayName or email
        querySnapshot = await usersRef.where('displayName', '==', query).get();
        querySnapshot.forEach(doc => {
          const userData = doc.data();
          if (!users.some(user => user.id === doc.id)) {
            users.push({
              id: doc.id,
              displayName: userData.displayName,
              email: userData.email,
              photoURL: userData.photoURL
            });
          }
        });
        // Also search by email
        querySnapshot = await usersRef.where('email', '==', query).get();
        querySnapshot.forEach(doc => {
          const userData = doc.data();
          if (!users.some(user => user.id === doc.id)) {
            users.push({
              id: doc.id,
              displayName: userData.displayName,
              email: userData.email,
              photoURL: userData.photoURL
            });
          }
        });
      }
    }

    return users;
  } catch (error) {
    throw new functions.https.HttpsError('unknown', error.message, error);
  }
});



exports.updateUserOnLogin = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  try {
    const userRecord = await admin.auth().getUser(context.auth.uid);
    const { displayName, email, photoURL } = userRecord;

    // Update the user document in Firestore
    await db.doc(`users/${context.auth.uid}`).set({
      displayName,
      email,
      photoURL
    }, { merge: true });

    return { message: 'User data updated successfully.' };
  } catch (error) {
    console.error('Error updating user data:', error);
    throw new functions.https.HttpsError('unknown', 'Failed to update user data', error);
  }
});

exports.syncShared = functions.firestore
    .document('sharedAnalyses/{docId}')
    .onWrite(async (change, context) => {
      console.log("Share sync triggered")
        const analysisId = change.after.exists ? change.after.data().analysisId : change.before.data().analysisId;
        const ownerId = change.after.exists ? change.after.data().ownerId : change.before.data().ownerId;
        console.log("Syncing for owner: ", ownerId)
        console.log("Syncing for analysis: ", analysisId)
        // Reference to the analysis document
        const analysisDocRef = db.doc(`users/${ownerId}/analyses/${analysisId}`);

        // If the document is being deleted, we don't have a 'data' to work with
        if (!change.after.exists) {
          console.log("Share doc deleted")
            // Handle deletion logic if necessary, for example, removing a user from sharedWith
            // This is more complex because you'd need to identify which user was removed
            // You may need a separate logic or function to handle deletions properly
            return;
        }

        // Directly use the sharedWith array from the sharedAnalyses document
        const sharedWith = change.after.data().sharedWith;

        console.log("Shared with: ", sharedWith)

        // Update the analysis document's sharedWith array to match
        await analysisDocRef.update({ sharedWith }).catch(error => {
            console.error("Error updating analysis document:", error);
        });
    });