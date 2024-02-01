import React, { useState, useEffect, useContext } from 'react';
import userManager from '../../services/user/userManager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { getFirebaseErrorMessage } from '../../../utils/errorUtil';
import { AlertContext } from '../general/Alert/AlertContext';

const Login = ({ onLoginSuccess, verifyEmail = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [userAuth, setUserAuth] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [isVerificationMode, setIsVerificationMode] = useState(verifyEmail);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [timer, setTimer] = useState(0);
  const { setSuccessMessage, setErrorMessage } = useContext(AlertContext);

  useEffect(() => {
    let interval = null

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {

    const handleUserAuthChange = (newUserAuth) => {
      setUserAuth(newUserAuth);
    };
    userManager.subscribeToUserAuth(handleUserAuthChange);

    return () => {
      userManager.unsubscribeFromUserAuth(handleUserAuthChange);
    };
  }, []);

  useEffect(() => {

    if(isVerificationMode) {
      sendVerificationEmail()
    }

  }, [isVerificationMode]);



  const handleAuthOperation = async (operation) => {
    setError(null);
    setLoading(true)

    try {
      await operation();
      onLoginSuccess();
    } catch (err) {
      const userFriendlyError = getFirebaseErrorMessage(err);
      setError(userFriendlyError);
      setLoading(false)
      const timer = setTimeout(() => {
        setError(null);
      }, 7000);

      return () => clearTimeout(timer);
    }
  };

  const handleSignInWithEmailPassword = (e) => {
    e.preventDefault();
    handleAuthOperation(() => userManager.signInWithEmailAndPassword(email, password));
  };

  const handleSignUpWithEmailPassword = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const thisUserCredential = await userManager.signUpWithEmailPassword(email, password);
      //await sendVerificationEmail(thisUserCredential);
      setMessage("Please check your email for the verification link.");
      setIsVerificationMode(true)
      //checkEmailVerification(thisUserCredential.user);
    } catch (error) {
      setMessage(null);
      const userFriendlyError = getFirebaseErrorMessage(error);
      setError(userFriendlyError);
    } finally {
      setLoading(false);
    }
  };


  const sendVerificationEmail = async () => {
    if(timer > 0) return 

    setTimer(60); // Start the countdown from 60 seconds
    try {
      setMessage("Please check your email for the verification link.");
      setLoading(true);
      await userManager.sendEmailVerification(userAuth);
      setIsVerificationMode(true);
    } catch (error) {
      setMessage(null);
      const userFriendlyError = getFirebaseErrorMessage(error);
      setError(userFriendlyError);
    } finally {
      setLoading(false);
    }
  };


  const checkEmailVerification = async () => {
    setLoading(true)

    try {
      if (userAuth) {
        await userAuth.reload();
        const updatedUser = userManager.getAuth().currentUser
        if (updatedUser.emailVerified) {
          onLoginSuccess(); // Proceed with the login process
          setSuccessMessage({
            type: "success",
            short: `Email verified`,
            long: `Your email has been verified successfully.`
        });
        } else {
          setMessage(null)
          setError("Email not verified yet. Please try again.")
        }
      } 
    } catch (error) {
      setMessage(null)
      console.error("Error checking verify", error)
      setError("Email not verified yet. Please try again.")
    } finally {
      setLoading(false)
    }
  };


  const handlePasswordRecovery = async (e) => {
    e.preventDefault();

    setLoading(true)
    setError(null)

    try {
      await userManager.resetPassword(recoveryEmail)
      setLoading(false)
      setMessage("A recovery email has been sent to you with instructions on how to reset your password.")
    } catch (err) {
      setError("The email you entered is not connected to an account.")
      setLoading(false)
      setMessage(null)
    }
  };

  const handleSignInWithGoogle = (e) => {
    e.preventDefault();
    handleAuthOperation(() => userManager.signInWithGoogle());
  };

  const handleSignInWithGitHub = (e) => {
    e.preventDefault();
    handleAuthOperation(() => userManager.signInWithGitHub());
  };

  const handleSignInWithMicrosoft = (e) => {
    e.preventDefault();
    handleAuthOperation(() => userManager.signInWithMicrosoft());
  };


  // JSX for Sign-In Form
  const signComponent = (
    <form className="space-y-6" onSubmit={isSignUp ? handleSignUpWithEmailPassword : handleSignInWithEmailPassword}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium ">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          className="input h-10 input-bordered w-full mt-2 bg-base-300"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium ">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          className="input h-10 input-bordered w-full mt-2 bg-base-300"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <button
          type="submit"
          className="group relative flex btn h-10 btn-sm btn-primary w-full text-gray-100"
        >
          {isLoading ? <div className="loading loading-spinner loading-sm"></div> : isSignUp ? 'Sign up' : 'Sign in'}
        </button>
      </div>
    </form>
  );

  // JSX for Password Recovery Form
  const recoveryComponent = (
    <>
      <form className="space-y-6" onSubmit={handlePasswordRecovery}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium ">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="input h-10 input-bordered w-full mt-2 bg-base-300"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button className="group relative flex btn h-10 btn-sm btn-primary w-full text-base-200">
          {isLoading ? <div className="loading loading-spinner loading-sm"></div> : 'Send recovery email'}
        </button>
        <div className="mt-6 flex items-center justify-center">
          <div className="text-sm">
            <a href="#" onClick={() => setIsRecoveryMode(false)} className="font-medium text-primary hover:text-primary/90">
              Try signing in again
            </a>
          </div>
        </div>
      </form>
    </>
  );

  const verificationComponent = (
    <div className="flex flex-col items-center justify-center gap-4">
      <button className="relative flex btn h-10 btn-sm btn-primary w-full max-w-[250px] text-base-200" onClick={() => checkEmailVerification()}>
        {isLoading ? <div className="loading loading-spinner loading-sm">Sending email</div> : 'Verify email'}
      </button>
      <div className="text-sm">
        <button onClick={() => sendVerificationEmail()} className={`font-medium text-primary hover:text-primary/90 ${timer > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
          Resend verification email {timer > 0 ? `in ${timer}` : ''}
        </button>
      </div>
      <p className="text-xs text-center text-neutral-content/60">When you have clicked the link in the email to {email || userAuth?.email}, head back to this page and click "Verify email" to log in.</p>
    </div>
  );


  return (
    <div className="flex w-full sm:w-5/6">
      <div className="md:px-8 py-4 w-full px-2">
        <div className="flex items-center justify-center">
          <div className="logo-sm"></div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-neutral-content/90">
          {isVerificationMode ? 'Verify your email' : isRecoveryMode ? "Recover your account" : isSignUp ? "Create an account" : "Sign in to your account"}
        </h2>
        <div className="mt-8 w-full">
          <p className={`mb-6 text-center ${error && !message ? 'text-error' : 'text-neutral-content'}`}>{message || error}</p>

          {isRecoveryMode ? recoveryComponent : isVerificationMode ? verificationComponent : signComponent}

          {isRecoveryMode || isVerificationMode ? '' :
            <>
              {/*
              <div className="mt-6 flex items-center justify-center">
                <div className="text-sm">
                  <a href="#" onClick={() => setIsRecoveryMode(true)} className="font-medium text-primary hover:text-primary/90">
                    {isSignUp ? '' : 'Forgot your password?'}
                  </a>
                </div>
              </div>
            */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-content/30"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-base-300 px-2 text-neutral-content/60">Or continue with</span>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div>
                    <button
                      onClick={handleSignInWithGoogle}
                      className="inline-flex w-full btn border-neutral-content/30 shadow-sm h-10 btn-sm btn-ghost"
                    >
                      <span className="sr-only">Sign in with Google</span>
                      <img src="https://asset.brandfetch.io/id6O2oGzv-/idvNIQR3p7.svg" className="h-5 w-5" alt="Google" />
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={handleSignInWithGitHub}
                      className="inline-flex w-full btn border-neutral-content/30 shadow-sm h-10 btn-sm btn-ghost"
                    >
                      <span className="sr-only">Sign in with GitHub</span>
                      <FontAwesomeIcon icon={faGithub} size="xl" />
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={handleSignInWithMicrosoft}
                      className="inline-flex w-full btn border-neutral-content/30 shadow-sm h-10 btn-sm btn-ghost"
                    >
                      <span className="sr-only">Sign in with Microsoft</span>
                      <img src="https://asset.brandfetch.io/idchmboHEZ/iduap5ndHF.svg" className="h-5 w-5" alt="Microsoft" />
                    </button>
                  </div>
                </div>
              </div>
              {isSignUp ?
                <p className="mt-6 text-center text-sm ">
                  Already have an account?{' '}
                  <a href="#" onClick={() => setIsSignUp(false)} className="font-medium text-primary hover:text-primary/90">
                    Sign in
                  </a>
                </p>
                :
                <p className="mt-6 text-center text-sm ">
                  Don't have an account?{' '}
                  <a href="#" onClick={() => setIsSignUp(true)} className="font-medium text-primary hover:text-primary/90">
                    Sign up
                  </a>
                </p>
              }
            </>
          }
        </div>
      </div>
    </div>
  );
};

export default Login;

