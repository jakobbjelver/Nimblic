"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchDiscussionOptions = exports.fetchHistory = void 0;
const config_1 = require("./config");
const admin = require('firebase-admin');

// Check if the Firebase app has been initialized
console.log("Checking if Firebase app has been initialized...");
if (admin.apps.length === 0) { // If not, initialize it
    console.log("Firebase app not initialized. Initializing...");
    admin.initializeApp();
    console.log("Firebase app initialized.");
} else {
    console.log("Firebase app already initialized.");
}

// Now you can safely use admin.firestore() to get the Firestore instance
console.log("Getting Firestore instance...");
const db = admin.firestore();
console.log("Firestore instance obtained.");

async function fetchAnalysisData(userId, analysisId, topic) {
    console.log(`Fetching analysis data for userId: ${userId}, analysisId: ${analysisId}, topic: ${topic}`);
    const analysisRef = db.collection('users').doc(userId).collection('analyses').doc(analysisId);
    const analysisDataSnap = await analysisRef.get();
    if (!analysisDataSnap.exists) {
        console.error('No analysis data found for analysisId:', analysisId);
        return {};
    } 
    const analysisData = analysisDataSnap.data();
    console.log(`Analysis data fetched successfully for analysisId: ${analysisId}.`);
    return analysisData[topic] || {}; // Adjust this based on your data structure
}

const { promptField, responseField, orderField } = config_1.default;

const version = 4
console.log(`Version ::::::::: ${version}`)

async function fetchHistory(ref) {
    console.log(`Fetching history from reference path: ${ref.path}`);
    const collSnap = await ref.parent.orderBy(orderField, 'desc').get();
    const refData = await ref.get();
    const refOrderFieldVal = refData.get(orderField);

    let historyWithAnalysis = [];
    let analysisData = {};

    const userId = ref.path.split('/')[1]; // Extract userId
    console.log(`Extracted userId: ${userId} from path.`);

    // Identify the correct most recent message document
    let mostRecentDocForAnalysis = null;
    for (const doc of collSnap.docs) {
        if (doc.get(orderField) <= refOrderFieldVal) {
            mostRecentDocForAnalysis = doc;
            break; // Found the most recent document relative to the reference document
        }
    }

    if (mostRecentDocForAnalysis) {
        console.log("Processing most recent document for analysis data...");
        const analysisId = mostRecentDocForAnalysis.ref.path.split('/')[3];
        console.log(`Extracted analysisId: ${analysisId} from most recent document path.`);
        const topic = mostRecentDocForAnalysis.get('topic');
        console.log(`Topic found: ${topic}`);
        if (topic) {
            analysisData = await fetchAnalysisData(userId, analysisId, topic);
            console.log(`Fetched analysis data for topic: ${topic}`);
        } else {
          console.error("No topic exists.")
        }
    } else {
        console.error("No documents found that are prior to or match the reference document. ");
    }

    // Process and log each relevant document, including appending analysis data for the most recent document
collSnap.docs.filter(doc => doc.get(orderField) <= refOrderFieldVal).forEach(doc => {
    const prompt = doc.get(promptField) || ""; // Default to empty string if undefined
    const response = doc.get(responseField) || ""; // Default to empty string if undefined

    console.log("Filtering docs by order field...")

    let mergedData = `Prompt: '${prompt}'`;
    if (doc.id === mostRecentDocForAnalysis?.id && analysisData && Object.keys(analysisData).length > 0) {
        mergedData += `, Use the following analysis data as a reference when asked to provide answers about data or analyses: "analysisData": ${JSON.stringify(analysisData)}`;
        console.log(`Final prompt with analysis for the most recent document: ${mergedData}`);
    }

    historyWithAnalysis.push({
        path: doc.ref.path,
        prompt: mergedData,
        response: response,
    });
});

    console.log("Completed fetching history with analysis: ", historyWithAnalysis);
    return historyWithAnalysis;
}

exports.fetchHistory = fetchHistory;
async function fetchDiscussionOptions(ref) {
    const discussionDocRef = ref.parent.parent;
    if (!discussionDocRef)
        return {};
    const discussionDocSnap = await discussionDocRef.get();
    if (!discussionDocSnap.exists)
        return {};
    const overrides = (0, overrides_1.extractOverrides)(discussionDocSnap);
    if (discussionDocSnap.get('examples')) {
        const examples = discussionDocSnap.get('examples');
        const validatedExamples = validateExamples(examples);
        if (validatedExamples.length > 0) {
            overrides.examples = validatedExamples;
        }
    }
    if (discussionDocSnap.get('continue')) {
        const continueHistory = discussionDocSnap.get('continue');
        const validatedContinueHistory = validateExamples(continueHistory);
        if (validatedContinueHistory.length > 0) {
            overrides.examples = validatedContinueHistory;
        }
    }
    return overrides;
}
exports.fetchDiscussionOptions = fetchDiscussionOptions;
function validateExamples(examples) {
    if (!Array.isArray(examples)) {
        throw new Error('Invalid examples: ' + JSON.stringify(examples));
    }
    const validExamples = [];
    for (const example of examples) {
        // check obj has prompt or response
        const prompt = example.prompt;
        const response = example.response;
        if (typeof prompt !== 'string' || typeof response !== 'string') {
            throw new Error('Invalid examples or continue history: ' + JSON.stringify(example));
        }
        validExamples.push(example);
    }
    return validExamples;
}
//# sourceMappingURL=firestore.js.map