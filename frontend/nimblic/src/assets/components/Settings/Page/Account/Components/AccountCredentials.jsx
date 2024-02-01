import React, { useState, useEffect, useContext } from 'react';
import UserManager from '../../../../../services/user/userManager';
import { AlertContext } from '../../../../general/Alert/AlertContext';
import { useModal } from '../../../../general/Modal/ModalContext'
import { getFirebaseErrorMessage } from '../../../../../../utils/errorUtil';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import Login from '../../../../Auth/Login';
import ReauthenticateComponent from './ReauthenticateComponent'
import { getCurrentTime } from 'src/utils/textFormat'

const AccountCredentials = ({ userAuth }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState(userAuth.email);
    const { setSuccessMessage, setErrorMessage, setWarningMessage } = useContext(AlertContext);
    const [loading, setLoading] = useState(false);
    const { openModal, closeModal, setModalActions } = useModal();

    const isPasswordMatch = () => {
        return password && confirmPassword && password === confirmPassword;
    };

    const isSaveDisabled = () => {
        if(!password && !confirmPassword) {
            if(email) {
                return false
            } else {
                return true
            }
        } else {
            return !isPasswordMatch()
        }
    }


    const handleReauthentication = () => {
        setModalActions(["Cancel", null])

        const providerId = userAuth.providerData[0].providerId;

        openModal(
            <ReauthenticateComponent onSuccess={() => {
                closeModal();
                handleSave();
            }}
                providerId={providerId} />,
            () => closeModal()
        );
    }

    const handleVerifyEmail = () => {
        setModalActions(["Cancel"])
        // Open the login modal
        openModal(
            <Login onLoginSuccess={() => {
                closeModal(); // Close the modal on successful login
            }}
                verifyEmail={true} />,
            () => closeModal()
        );
    }


    const handleSave = async () => {
        setLoading(true);

        const updatedCredentials = [];
        let errorOccurred = false;

        if (email !== userAuth.email) {
            console.log("email", email)
            console.log("userAuth.email", userAuth.email)

            try {
                await UserManager.updateEmail(email);
                updatedCredentials.push('email');

                setWarningMessage({
                    type: "warning",
                    short: "Verify email to confirm change",
                    long: "Please verify your email address in order to confirm the email change. Check your inbox and click the link in the email we sent you.",
                    time: getCurrentTime()
                })

                userAuth.reload()
            } catch (error) {

                console.error("Error updating email: " + error);

                if (error.code == 'auth/requires-recent-login') {
                    handleReauthentication()
                    setLoading(false)
                    return;
                } else {
                    setErrorMessage({
                        type: "error",
                        short: "Error updating email",
                        long: getFirebaseErrorMessage(error),
                        details: error,
                        time: getCurrentTime()
                    });
                    errorOccurred = true;
                }
            }
        }

        if (password) {
            if (!userAuth.emailVerified && userAuth.email) {
                setErrorMessage({
                    type: "error",
                    short: "Verify email to update password",
                    time: getCurrentTime()
                });
                setLoading(false);
                errorOccurred = true;
                return;
            } else if (!userAuth.email) {
                setErrorMessage({
                    type: "error",
                    short: "Add email to update password",
                    time: getCurrentTime()
                });
                setLoading(false);
                errorOccurred = true;
            } else {
                try {
                    await UserManager.handlePasswordChange(userAuth, email, password);
                    updatedCredentials.push('password');
                } catch (error) {
                    console.error("Error updating password: ", error);

                    if (error.code == 'auth/requires-recent-login') {
                        handleReauthentication()
                        setLoading(false)
                        return;
                    } else {
                        setErrorMessage({
                            type: "error",
                            short: "Error updating password",
                            long: getFirebaseErrorMessage(error),
                            details: error,
                            time: getCurrentTime()
                        });
                        errorOccurred = true;
                    }

                }
            }
        }

        if (!errorOccurred && updatedCredentials.length > 0) {
            setSuccessMessage({
                type: "success",
                short: `Successfully updated ${updatedCredentials.join(" and ")}`,
                long: `Your ${updatedCredentials.join(" and ")} has been updated successfully.`,
                time: getCurrentTime()
            });
        }

        setLoading(false);
    };

    return (
        <div className="flex flex-col gap-4 md:items-end items-center md:mb-0 mb-6 md:w-auto w-full">
            <div className="w-full md:w-fit max-w-xs flex flex-col">
                <label htmlFor="email" className="text-sm font-medium">
                    Email
                </label>
                <div className="relative w-full md:w-72">
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        className="input h-10 input-bordered w-full mt-1 bg-base-300 disabled:bg-base-100 disabled:text-neutral-content/80"
                        value={email || ' '}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {!userAuth.emailVerified && userAuth.email &&

                        <div className="tooltip absolute right-3 top-1/2 transform -translate-y-1/3" data-tip="Email is unverified">
                            <ExclamationTriangleIcon className="w-6 h-6 text-warning " aria-hidden="true" />
                        </div>
                    }

                </div>
                {!userAuth.emailVerified && userAuth.email &&
                    <a className="link link-primary text-md md:text-end text-center mt-2" onClick={() => handleVerifyEmail()}>
                        Verify email
                    </a>
                }

                <label htmlFor="password" className="text-sm font-medium mt-4">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    className="input h-10 input-bordered md:w-72 w-full mt-1 bg-base-300"
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {password &&
                    <>
                        <label htmlFor="password" className="text-sm font-medium mt-4">
                            Confirm password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            className="input h-10 input-bordered md:w-72 w-full mt-2 bg-base-300"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </>
                }
            </div>
            <button
                onClick={handleSave}
                className="btn btn-primary btn-sm w-32 text-base-300 mt-2 disabled:bg-primary/70 disabled:text-base-300/70"
                disabled={isSaveDisabled() || loading }>
                {loading ? <i className="loading loadings-spinner loading-sm"></i> : "Save"}
            </button>
        </div>
    );
};

export default AccountCredentials;