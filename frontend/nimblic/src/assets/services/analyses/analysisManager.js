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
      throw error;
    }
  }

  async fetchAnalysis(analysisId, ownerId = this.userId) {
    // Reference to the analysis document for metadata
    const analysisDocRef = doc(db, `users/${ownerId}/analyses/${analysisId}`);
    // Reference to the main data document
    const analysisDataDocRef = doc(db, `users/${ownerId}/analyses/${analysisId}/data/main`);

    try {
      // Fetch the metadata
      const analysisSnap = await getDoc(analysisDocRef);
      if (!analysisSnap.exists()) {
        console.error('No analysis metadata found for analysisId:', analysisId);
        return {};
      }
      const metadata = analysisSnap.data();

      // Fetch the main data
      const analysisDataSnap = await getDoc(analysisDataDocRef);
      if (!analysisDataSnap.exists()) {
        console.error('No analysis data found for analysisId:', analysisId);
        return {}; // Return only metadata if main data doesn't exist
      }
      const analysisData = analysisDataSnap.data();

      // Merge metadata into analysisData
      const combinedData = {
        ...analysisData.analysisData, // Spread the main analysis data
        metadata: metadata // Insert the metadata under a 'metadata' key or merge directly as needed
      };

      return combinedData;
    } catch (error) {
      console.error("Error fetching analysis data and metadata:", error);
      throw error;
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
  async unshareAnalysis(analysisId, userIdToUnshare, ownerId = this.userId) {
    console.log(`Unsharing analysis, id: ${analysisId}, userId: ${userIdToUnshare}, ownerId: ${ownerId}`)
    const sharedAnalysisQuery = query(collection(db, 'sharedAnalyses'), where('analysisId', '==', analysisId), where('ownerId', '==', ownerId), where('sharedWith', 'array-contains', userIdToUnshare));
    const querySnapshot = await getDocs(sharedAnalysisQuery);

    if (!querySnapshot.empty) {
      // Shared document exists
      const docRef = querySnapshot.docs[0].ref;
      try {
        await updateDoc(docRef, {
          sharedWith: arrayRemove(userIdToUnshare) // Firestore arrayRemove to remove the user
        });
      } catch (error) {
        console.error(error)
        throw error
      }
    }
  }

  // Method to unshare multiple analyses
  async unshareSelectedAnalyses(selectedAnalyses) {
    try {
      const unsharePromises = selectedAnalyses.map((sa) => this.unshareAnalysis(sa.id, this.userId, sa.ownerId));
      await Promise.all(unsharePromises);
    } catch (error) {
      console.error(error)
      throw error
    }
  }


  async updateAccessLevel(analysisId, isPublic) {
    try {
      const analysisDocRef = doc(db, this.analysesPath, analysisId);
      await updateDoc(analysisDocRef, {
        "status.isPublic": isPublic
      });
    } catch (error) {
      console.error("Error updating access level:", error);
      throw error;
    }
  }

}

export default AnalysisManager;
