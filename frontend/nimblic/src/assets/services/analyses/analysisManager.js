import { collection, query, where, onSnapshot, doc, deleteDoc, getDoc, getDocs, addDoc, arrayRemove, arrayUnion, updateDoc } from 'firebase/firestore';
import { firestore as db } from '../../../firebase-config';

class AnalysisManager {
  constructor(userId) {
    this.userId = userId;
    this.analysesPath = `users/${userId}/analyses`;
    this.unsubscribe = null;
  }

  subscribe(callback) {
    console.log("ANALYSES PATH: ", this.analysesPath)
    try {
      const q = query(collection(db, this.analysesPath));
      this.unsubscribe = onSnapshot(q, (snapshot) => {
        const analysesMetadata = []; // This will hold the metadata of all analyses
        snapshot.forEach((doc) => {
          const metadata = doc.data();
          analysesMetadata.push({ id: doc.id, ...metadata }); // Store only the document ID and its metadata
        });
        // Fetch shared analysis info for each analysis and merge it
        callback(analysesMetadata); // Invoke the callback with the merged data
      }, (error) => {
        console.error("Error subscribing to owned analyses: ", error)
        callback([])
        //throw new Error(error)
      });
    } catch (error) {
      console.error("Error subscribing to owned analyses: ", error)
      callback([])
      //throw new Error(error)
    }
  }

  // Unsubscribe from the analysis collection
  unsubscribeFromAnalyses() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }


  // TODO: Properly sync sharedAnalyses docs with the sharedWith array
  // Right now this function will return "permission-denied" when an analysis is deleted by the owner, which leaves the 
  // sharedAnalysis doc left alive
  subscribeToShared(callback) {
    try {
      const q = query(collection(db, 'sharedAnalyses'), where('sharedWith', 'array-contains', this.userId));
      this.unsubscribe = onSnapshot(q, async (snapshot) => {
        const sharedAnalysesPromises = []; // Initialize an empty array to hold promises

        snapshot.forEach((documentSnapshot) => {
          const sharedAnalysis = documentSnapshot.data();

          console.log("OwnerId: ", sharedAnalysis.ownerId)
          console.log("AnalysisId: ", sharedAnalysis.analysisId)

          // Use a different variable name or directly use `doc()` function without assignment
          const analysisDocRef = doc(db, `users/${sharedAnalysis.ownerId}/analyses/${sharedAnalysis.analysisId}`);
          const promise = getDoc(analysisDocRef).then(analysisDocSnapshot => {
            if (analysisDocSnapshot.exists()) {
              return { id: analysisDocSnapshot.id, ...analysisDocSnapshot.data() };
            }
            return null;
          }, (error) => {
            console.error("Subscribe to shared error: ", error);
            callback([]);
          });
          sharedAnalysesPromises.push(promise); // Push each promise into the array
        }, (error) => {
          console.error("Subscribe to shared error: ", error);
          callback([]);
        });
        const sharedAnalyses = (await Promise.all(sharedAnalysesPromises)).filter(a => a !== null && a !== undefined);
        callback(sharedAnalyses);
      }, (error) => {
        console.error("Subscribe to shared error: ", error);
        callback([]);
      });
    } catch (error) {
      console.error("Subscribe to shared error: ", error);
      callback([]);
    }
  }



  // Delete one or more analyses
  async deleteAnalyses(analysisIds) {
    const deletePromises = analysisIds.map((id) => deleteDoc(doc(db, this.analysesPath, id)));
    await Promise.all(deletePromises);
  }

  async fetchAnalysisData(analysisId, ownerId = this.userId) {
    const analysisDataDocRef = doc(db, `users/${ownerId}/analyses/${analysisId}/data/main`);

    try {
      const analysisDataSnap = await getDoc(analysisDataDocRef);
      if (!analysisDataSnap.exists()) {
        console.error('No analysis data found for analysisId:', analysisId);
        return {};
      }
      return analysisDataSnap.data();
    } catch (error) {
      console.error("Error fetching analysis data:", error);
      throw new Error(error);
    }
  }


  // Method to share an analysis with another user
  async shareAnalysis(analysisId, userIdToShareWith) {
    const sharedAnalysisQuery = query(collection(db, 'sharedAnalyses'), where('analysisId', '==', analysisId), where('ownerId', '==', this.userId));
    const querySnapshot = await getDocs(sharedAnalysisQuery);

    if (querySnapshot.empty) {
      // No existing share document, create a new one
      await addDoc(collection(db, 'sharedAnalyses'), {
        analysisId: analysisId,
        ownerId: this.userId,
        sharedWith: [userIdToShareWith] // Start with an array containing the user to share with
      });
    } else {
      // Document exists, update the sharedWith array to include the new user
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        sharedWith: arrayUnion(userIdToShareWith) // Firestore arrayUnion to add a user without duplicating
      });
    }
  }


  // Method to unshare an analysis
async unshareAnalysis(analysisId, userIdToUnshare) {
  const sharedAnalysisQuery = query(collection(db, 'sharedAnalyses'), where('analysisId', '==', analysisId), where('ownerId', '==', this.userId));
  const querySnapshot = await getDocs(sharedAnalysisQuery);

  if (!querySnapshot.empty) {
    // Shared document exists
    const docRef = querySnapshot.docs[0].ref;
    await updateDoc(docRef, {
      sharedWith: arrayRemove(userIdToUnshare) // Firestore arrayRemove to remove the user
    });
  }
}

}

export default AnalysisManager;
