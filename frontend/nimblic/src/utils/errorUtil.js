export function getFirebaseErrorMessage(error) {
    console.log("AUTH ERROR", error)
    const errorMappings = {
      "auth/email-already-in-use": "This email is already in use. Please try another email.",
      "auth/missing-email": "There is no account connected to that email.",
      "auth/invalid-email": "The email address is badly formatted.",
      "auth/weak-password": "The password is too weak. Please choose a stronger password.",
      "auth/user-disabled": "This account has been disabled. Please contact support.",
      "auth/user-not-found": "No account found with this email. Please sign up.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/invalid-credential": "Incorrect credientials. Please try again.",
      "auth/too-many-requests" : "Too many emails has been sent. Please try again at a later time."
    };
  
    const defaultErrorMessage = "An unexpected error occurred. Please try again later.";
    return errorMappings[error.code] || defaultErrorMessage;
  };