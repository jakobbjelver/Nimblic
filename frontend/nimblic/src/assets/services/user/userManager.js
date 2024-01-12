import { auth, firestore, firebase } from '../../../firebase-config';
import { doc, onSnapshot, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    deleteUser,
    updatePassword,
    linkWithPopup,
    unlink,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup,
    sendEmailVerification
} from 'firebase/auth';

class UserManager {

    userAuthSubscribers = [];
    userDataSubscribers = [];
    userAuth = null;
    userData = null;
    unsubscribeUserDataListener = null;

    userLoadedPromise = null;
    userLoadedResolve = null;

    constructor() {
        this.userLoadedPromise = new Promise((resolve, reject) => {
            this.userLoadedResolve = resolve;
        });

        auth.onAuthStateChanged(user => {
            this.userAuth = user;
            if (user) {
                this.subscribeToUserData(user.uid);
            } else {
                this.userData = null;
                if (this.unsubscribeUserDataListener) {
                    this.unsubscribeUserDataListener();
                }
                this.userLoadedResolve();
            }
            this.notifyUserAuthSubscribers();
            this.notifyUserDataSubscribers();
        });
    }

    async waitForUserLoad() {
        await this.userLoadedPromise;
    }

    // Sign Out User
    async signOut() {
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        }
    }

    // Subscribe to changes in user authentication state
    subscribeToUserAuth(callback) {
        this.userAuthSubscribers.push(callback);
        callback(this.userAuth);
    }

    // Unsubscribe from changes in user authentication state
    unsubscribeFromUserAuth(callback) {
        this.userAuthSubscribers = this.userAuthSubscribers.filter(sub => sub !== callback);
    }

    // Notify user authentication state subscribers
    notifyUserAuthSubscribers() {
        this.userAuthSubscribers.forEach(callback => callback(this.userAuth));
    }

    // Subscribe to changes in user data
    subscribeToUserData(uid) {
        if (this.unsubscribeUserDataListener) {
            this.unsubscribeUserDataListener();
        }

        const userDocRef = doc(firestore, "users", uid);
        this.unsubscribeUserDataListener = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                this.userData = doc.data();
                this.notifyUserDataSubscribers();
                this.userLoadedResolve();
            } else {
                console.error("No user data found!");
            }
        }, error => {
            console.error("Error subscribing to user data:", error);
        });
    }

    // Notify user data subscribers
    notifyUserDataSubscribers() {
        this.userDataSubscribers.forEach(callback => callback(this.userData));
    }

    // Subscribe to updates in user data
    subscribeToUserDataUpdates(callback) {
        this.userDataSubscribers.push(callback);
        if (this.userData) {
            callback(this.userData);
        }
    }

    // Unsubscribe from updates in user data
    unsubscribeFromUserDataUpdates(callback) {
        this.userDataSubscribers = this.userDataSubscribers.filter(sub => sub !== callback);
    }

    // Get user authentication state
    getUserAuth() {
        return this.userAuth;
    }

    // Get user data
    getUserData() {
        return this.userData;
    }

    getAuth() {
        return auth;
    }

// Delete user from Auth and Firestore
async deleteUser() {
    try {
        if (!auth.currentUser) {
            throw new Error("No authenticated user to delete.");
        }

        const uid = auth.currentUser.uid;

        // Delete user document from Firestore
        const userDocRef = doc(firestore, "users", uid);
        await deleteDoc(userDocRef);

        // Delete user from Firebase Authentication
        await deleteUser(auth.currentUser);  // You must reauthenticate the user before deleting

        //this.signOut()

        console.log("User successfully deleted from Auth and Firestore");
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;  // Re-throw the error to be handled by the caller
    }
}


    // Change user password
    async changePassword(user, newPassword) {
        try {
            // Check if user has a password (i.e., not signed in with a provider like Google)
            if (user.providerData.some(provider => provider.providerId === "password")) {
                await updatePassword(auth.currentUser, newPassword);
                console.log("Password successfully updated");
            } else {
                console.log("User signed in with a third-party provider. Cannot change password.");
            }
        } catch (error) {
            console.error("Error changing password:", error);
        }
    }

    // Link Google Account
    async linkGoogleAccount() {
        const provider = new GoogleAuthProvider();
        try {
            let result = await linkWithPopup(auth.currentUser, provider);
            console.log("Google account linked successfully");
            return result
        } catch (error) {
            console.error("Error linking Google account:", error);
        }
    }

    // Unlink Google Account
    async unlinkGoogleAccount() {
        try {
            let result = await unlink(auth.currentUser, GoogleAuthProvider.PROVIDER_ID);
            console.log("Google account unlinked successfully");
            return result
        } catch (error) {
            console.error("Error unlinking Google account:", error);
        }
    }

    // Sign up with email and password
    async signUpWithEmailPassword(email, password) {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const user = result.user;
            await this.createUserDocument(user);
            return user;
        } catch (error) {
            console.error("Error signing up with email and password:", error);
        }
    }

    async signInWithEmailAndPassword(user) {
        return signInWithEmailAndPassword(user);
    };

    async sendEmailVerification(user) {
        return sendEmailVerification(this.userAuth);
    };

    // Create user document in Firestore
    async createUserDocument(user) {
        try {
            const userDocRef = doc(firestore, "users", user.uid);
            const docSnap = await getDoc(userDocRef);

            if (!docSnap.exists()) {
                await setDoc(userDocRef, {
                    email: user.email,
                });
            } else {
                console.log("User already exists in the database.");
            }
        } catch (error) {
            console.error("Error in creating or checking user document:", error);
        }
    }

    // Sign in with Google
    async signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            await this.createUserDocument(user);
            return user;
        } catch (error) {
            console.error("Error signing in with Google:", error);
        }
    }

    // Reset user password
    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            console.log("Password reset email sent successfully");
        } catch (error) {
            console.error("Error sending password reset email:", error);
        }
    }
}

export default new UserManager();
