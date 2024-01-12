import React, { useEffect, useState } from 'react';
import UserManager from '../../../services/user/userManager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightToBracket, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

import { lineBreakText } from 'src/utils/textFormat';
import { useModal } from '../Modal/ModalContext';
import Login from '../../Auth/Login'
import { useNavigate, useLocation } from 'react-router-dom';

import { formatDate, countRecentTimestamps } from 'src/utils/dateFormat'

const UserAvatar = () => {
    const [userAuth, setUserAuth] = useState(UserManager.getUserAuth());
    const [userData, setUserData] = useState(UserManager.getUserData());
    const [username, setUserName] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const { openModal, closeModal, setModalActions } = useModal(); // Assuming this is your modal context
    const navigate = useNavigate();
    const location = useLocation();

    const signIn = () => {
        setLoading(true)
        setModalActions(["Cancel"])
        // Open the login modal
        openModal(
            <Login onLoginSuccess={() => {
                closeModal(); // Close the modal on successful login
            }} />,
            () => closeModal()
        );
        setLoading(false)
    }

    const signOut = () => {
        setLoading(true)
        const confirm = () => {
            navigate('/')
            UserManager.signOut()
            closeModal()
        }

        if (location.pathname !== '/') {
            setModalActions(["Cancel", ["Log out"]])
            openModal(
                <>
                    <div className="flex flex-col items-start px-4">
                        <h3 className="font-bold text-2xl">Log out and lose analysis?</h3>
                        <p className="py-4 h-40 flex items-center text-xl">You are about to log out and will lose your current analysis.</p>
                    </div>
                </>,
                () => confirm()
            );
        } else {
            confirm()
        }
        setLoading(false)
    }

    useEffect(() => {
        async function checkUserStatus() {
            await UserManager.waitForUserLoad();
            setLoading(false);
            setUserAuth(UserManager.getUserAuth());
            setUserData(UserManager.getUserData())
        }
        checkUserStatus();

        const handleUserAuthChange = (newUser) => {
            setUserAuth(newUser);
            if (newUser) {
                setUserName(newUser.displayName || newUser.email);
            }
        };

        const handleUserDataChange = (newUser) => {
            setUserData(newUser);
        };

        UserManager.subscribeToUserAuth(handleUserAuthChange);
        UserManager.subscribeToUserDataUpdates(handleUserDataChange)

        return () => {
            UserManager.unsubscribeFromUserAuth(handleUserAuthChange);
            UserManager.unsubscribeFromUserDataUpdates(handleUserDataChange)
        };
    }, []);

    if (isLoading) {
        return (
            <button className="btn btn-ghost btn-circle">
                <div className="loading loading-spinner"></div>
            </button>
        );
    }

    return (
        userAuth && userData ?
            <div className="dropdown dropdown-end">
                <label tabIndex="0" className={`btn btn-ghost btn-circle avatar ${!userAuth.photoURL ? 'placeholder bg-base-100 ring-1 ring-base-200' : ''}`}>
                    <div className="w-4/5 rounded-full">
                        {userAuth.photoURL ?
                            <img src={userAuth.photoURL} />
                            : <span className="text-xl">{username ? username.charAt(0).toUpperCase() : ''}</span>
                        }
                    </div>
                </label>
                <div tabIndex="0" className="mt-3 card card-compact dropdown-content min-w-[230px] w-fit bg-base-100 shadow">
                    <div className="card-body">
                        <div className={`flex flex-row items-center gap-2 ${userAuth.displayName ? 'whitespace-nowrap' : ''} font-bold text-lg font-nunit`}>{userAuth.displayName || lineBreakText(userAuth.email, 24)}
                        <div className={`font-sans font-normal badge badge-lg h-6 px-3 ${userData.accountType == 'Admin' ? 'bg-gradient-to-r from-primary to-secondary text-neutral' : userData.accountType == 'Premium' ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral' : 'bg-gradient-to-r from-slate-400 to-slate-500 text-neutral'}`}>
                            <p className="text-md">{userData.accountType}</p>
                        </div>
                        </div>
                        <div className="flex flex-col items-start justify-start">
                            <div className="flex flex-row gap-2 text-[0.8em] font-bold">RECENT UPLOADS
                            <div className="md:tooltip md:tooltip-right cursor-pointer font-normal" data-tip="From the last 24 hours">
                                <InformationCircleIcon className="h-5 w-5" aria-hidden="true" />
                            </div>
                            </div>
                            <span className="ml-2">{countRecentTimestamps(userData.lastUploads)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[0.8em] font-bold">LAST LOGIN</span>
                            <span className="">{formatDate(userAuth.metadata.lastSignInTime)}</span>
                        </div>
                        <div className="card-actions">
                            <button className="btn btn-primary btn-block btn-sm mt-2" onClick={() => signOut()}>
                                Log out
                                <FontAwesomeIcon icon={faRightFromBracket} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            :
            <>
                <button className="ml-2 btn btn-primary btn-block btn-sm" onClick={() => signIn()}>
                    Sign in
                    <FontAwesomeIcon icon={faRightToBracket} />

                </button>
            </>
    );
};

export default UserAvatar;

