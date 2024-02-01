import { auth, firestore } from '../../../firebase-config';
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
    sendEmailVerification,
    GithubAuthProvider,
    OAuthProvider,
    EmailAuthProvider,
    reauthenticateWithCredential,
    linkWithCredential,
    verifyBeforeUpdateEmail
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

    // Link Google Account
    async linkGoogleAccount() {
        const provider = new GoogleAuthProvider();
        try {
            let result = await linkWithPopup(auth.currentUser, provider);
            console.log("Google account linked successfully");
            return result
        } catch (error) {
            console.error("Error linking Google account:", error);
            return null
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
            return null
        }
    }

    // Link GitHub Account
    async linkGithubAccount() {
        const provider = new GithubAuthProvider();
        try {
            let result = await linkWithPopup(auth.currentUser, provider);
            console.log("GitHub account linked successfully");
            return result;
        } catch (error) {
            console.error("Error linking GitHub account:", error);
            return null
        }
    }

    // Unlink GitHub Account
    async unlinkGithubAccount() {
        try {
            let result = await unlink(auth.currentUser, GithubAuthProvider.PROVIDER_ID);
            console.log("GitHub account unlinked successfully");
            return result;
        } catch (error) {
            console.error("Error unlinking GitHub account:", error);
            return null
        }
    }

    // Link Microsoft Account
    async linkMicrosoftAccount() {
        const provider = new OAuthProvider('microsoft.com');
        try {
            let result = await linkWithPopup(auth.currentUser, provider);
            console.log("Microsoft account linked successfully");
            return result;
        } catch (error) {
            console.error("Error linking Microsoft account:", error);
            return null
        }
    }

    // Unlink Microsoft Account
    async unlinkMicrosoftAccount() {
        try {
            let result = await unlink(auth.currentUser, 'microsoft.com');
            console.log("Microsoft account unlinked successfully");
            return result;
        } catch (error) {
            console.error("Error unlinking Microsoft account:", error);
            return null
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

    async signInWithEmailAndPassword(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
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

    // Sign in with GitHub
    async signInWithGitHub() {
        const provider = new GithubAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            await this.createUserDocument(user);
            return user;
        } catch (error) {
            console.error("Error signing in with GitHub:", error);
        }
    }

    // Sign in with Microsoft
    async signInWithMicrosoft() {
        const provider = new OAuthProvider('microsoft.com');
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            await this.createUserDocument(user);
            return user;
        } catch (error) {
            console.error("Error signing in with Microsoft:", error);
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

    async updateEmail(newEmail) {
        try {
            if (!auth.currentUser) {
                throw new Error("No authenticated user to update email.");
            }
            await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
            console.log("Email updated and verification email sent.");
        } catch (error) {
            console.error("Error updating email:", error);
            throw error;
        }
    }

    async handlePasswordChange(userAuth, email, newPassword) {
        // Check if the user has a password linked
        const hasPassword = userAuth.providerData.some(provider => provider.providerId === "password");

        if (hasPassword) {
            // Update the existing password
            await updatePassword(auth.currentUser, newPassword);
        } else {
            // Link a new password to the user's account
            await updatePassword(auth.currentUser, newPassword);
        }
    }

    // Link a password to the user's account
    async linkPasswordToAccount(email, password) {
        const credential = EmailAuthProvider.credential(email, password);
        await linkWithCredential(auth.currentUser, credential);
        console.log("Password linked to account successfully.");
    }

    async reauthenticate(currentPassword, providerId) {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("No authenticated user found.");
        }
    
        try {
            if (providerId === 'password') {
                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                await reauthenticateWithCredential(user, credential);
            } else if (providerId === 'google.com') {
                const provider = new GoogleAuthProvider();
                await signInWithPopup(auth, provider);
            } else if (providerId === 'github.com') {
                const provider = new GithubAuthProvider();
                await signInWithPopup(auth, provider);
            } else if (providerId === 'microsoft.com') {
                const provider = new OAuthProvider('microsoft.com');
                console.log("PROVIDER: ", provider)
                console.log("AUTH: ", auth)
                await signInWithPopup(auth, provider);
            }
        } catch (error) {
            console.error("Reauthentication error:", error);
            throw error; // Re-throw the error to be handled by the caller
        }
    }
    

}

export default new UserManager();
