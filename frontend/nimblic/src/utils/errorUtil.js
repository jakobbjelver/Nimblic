export function getFirebaseErrorMessage(error) {
  console.log("FIREBASE ERROR",  error);
  console.log("FIREBASE ERROR CODE", error.code);
  const errorMappings = {
      // Firebase Auth errors
      "auth/email-already-in-use": "This email is already in use. Please try another email.",
      "auth/missing-email": "There is no account connected to that email.",
      "auth/invalid-email": "The email address is badly formatted.",
      "auth/weak-password": "The password is too weak. Please choose a stronger password.",
      "auth/user-disabled": "This account has been disabled. Please contact support.",
      "auth/user-not-found": "No account found with this email. Please sign up.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/invalid-credential": "Incorrect credentials. Please try again.",
      "auth/too-many-requests" : "Too many requests. Please try again later.",
      "auth/account-exists-with-different-credential": "An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.",
      "auth/operation-not-allowed": "This operation is not allowed. Please enable it in the Firebase Console.",
      "auth/requires-recent-login": "This operation is sensitive and requires recent authentication. Log in again before retrying this request.",

      // Firestore errors
      "permission-denied": "You do not have permission to access this resource. If possible, contact the data owner and then try again.",
      "unavailable": "The Firestore service is currently unavailable. Please try again later.",
      "deadline-exceeded": "The request took too long to complete. Please try again.",
      "resource-exhausted": "You have exceeded your Firestore quota. Please upgrade your plan.",
      "not-found": "The requested document was not found.",
      "already-exists": "A document with this ID already exists.",
      "cancelled": "The operation was cancelled.",
      "data-loss": "Unrecoverable data loss or corruption.",
      "unknown": "An unknown error occurred.",
      "internal": "An internal error occurred within Firestore.",
      "invalid-argument": "Invalid argument provided. Please check your query parameters.",
      "out-of-range": "Query range is out of bounds.",
      "failed-precondition": "The operation was rejected due to a failed precondition, such as editing a non-existent document.",

      // Custom Firebase Functions errors
      "resource-exhausted": "You've reached your plan's limit. Please try again later or upgrade your plan.",
      "unauthenticated": "You must be logged in to perform this action.",
      "permission-denied": "You don't have permission to access this resource. If possible, contact the data owner and then try again.",
      "not-found": "The requested resource was not found.",
      "invalid-argument": "Invalid input. Please check your data and try again.",
      "internal": "An internal error occurred. Please try again later.",
      "unknown": "An unexpected error occurred. Please try again.",
      "cancelled": "The operation was cancelled.",
      "deadline-exceeded": "The operation took too long to complete. Please try again later.",
      "failed-precondition": "The operation was rejected due to a failed precondition.",
      "out-of-range": "The operation was called with out-of-range values.",
      "data-loss": "Critical data loss occurred. Please contact support.",
      
      // Specific to your Firebase Functions
      "chat-credits-exhausted": "No chat credits left. Please try again later or upgrade your plan.",
      "analysis-data-not-found": "No analysis data found for the given ID.",
      "user-data-update-failed": "Failed to update user data.",
      "sync-shared-error": "Error syncing shared analysis information.",
      "search-users-failed": "Failed to search for users. Please refine your search and try again.",
  };

  const defaultErrorMessage = "An unexpected error occurred. Please try again later.";

    // First, try to map using the error code if it exists
    if (error.code && errorMappings[error.code]) {
        return errorMappings[error.code];
    }

    // If there's no .code property or no mapping for the code, use a fallback strategy
    const errorString = typeof error === 'string' ? error.toLowerCase() : JSON.stringify(error).toLowerCase();

    // Check if errorString includes keys from errorMappings
    for (const [key, message] of Object.entries(errorMappings)) {
        if (errorString.includes(key.toLowerCase())) {
            return message;
        }
    }

    // If the error isn't recognized, log the error and return a default message
    console.log(`Unmapped error: ${errorString}`);
    return error.message || defaultErrorMessage;
}
