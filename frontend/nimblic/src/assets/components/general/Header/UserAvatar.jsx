import React, { Fragment, useEffect, useState, useContext } from 'react';
import UserManager from '../../../services/user/userManager';
import { Popover, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightToBracket, faRightFromBracket, faGear } from '@fortawesome/free-solid-svg-icons';
import ReactDOM from 'react-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

import { lineBreakText } from 'src/utils/textFormat';
import { useModal } from '../Modal/ModalContext';
import Login from '../../Auth/Login'
import { useNavigate, useLocation } from 'react-router-dom';

import { formatDate } from 'src/utils/dateFormat'

import { FileUploadContext } from '../Upload/FileUploadContext';

const UserAvatar = () => {
    const [userAuth, setUserAuth] = useState(UserManager.getUserAuth());
    const [userData, setUserData] = useState(UserManager.getUserData());
    const [username, setUserName] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const { openModal, closeModal, setModalActions } = useModal(); // Assuming this is your modal context
    const navigate = useNavigate();
    const location = useLocation();
    const { uploadData } = useContext(FileUploadContext);

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

    const signOut = () => {

        setLoading(true)
        const confirm = () => {
            navigate('/')
            UserManager.signOut()
            closeModal()
        }

        if (location.pathname !== '/' && uploadData.length > 0) {
            setModalActions(["Cancel", ["Log out"]])
            openModal(
                <>
                    <div className="flex flex-col items-start px-4">
                        <h3 className="font-bold text-2xl mr-4">Log out and leave?</h3>
                        <p className="py-4 h-40 flex items-center text-xl">You are about to log out and will lose your current analysis..</p>
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
        console.log("userAuth", userAuth)
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
            <Popover className="relative">
                {({ open, close }) => (
                    <>
                        <Popover.Button as="label" className={`btn btn-ghost btn-circle avatar ${!userAuth.photoURL ? 'placeholder bg-base-100 ring-1 ring-base-200' : ''}`}>
                            <div className="w-4/5 rounded-full">
                                {userAuth.photoURL ?
                                    <img src={userAuth.photoURL} alt="User" />
                                    : <span className="text-xl">{username ? username.charAt(0).toUpperCase() : ''}</span>
                                }
                            </div>
                        </Popover.Button>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-50"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-1"
                        >
                            <Popover.Panel className="md:absolute fixed z-10 mt-4 -translate-x-1/2 md:-translate-x-3/4 left-1/2 min-w-[230px] w-fit">

                                <div className="w-screen max-w-xs flex-auto overflow-hidden rounded-3xl bg-base-300 text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
                                    <div className="flex flex-col px-6 py-6 gap-3">
                                        <div className={`flex flex-row items-center gap-2 ${userAuth.displayName ? 'whitespace-nowrap' : ''} font-bold text-xl font-nunito`}>{userAuth.displayName || lineBreakText(userAuth.email, 18)}
                                            <div className={`font-sans font-normal border-none badge badge-lg h-6 px-3 shadow-sm ${userData.accountType == 'Admin' ? 'bg-gradient-to-r from-primary to-secondary text-neutral' : userData.accountType == 'Premium' ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral' : 'bg-gradient-to-r from-slate-400 to-slate-500 text-neutral'}`}>
                                                <div className="text-md">{userData.accountType || <div className="loading loadings-spinner loading-xs"></div>}</div>
                                            </div>
                                        </div>
                                        {!userAuth.emailVerified && userAuth.email &&
                                            <div className="flex flex-row gap-5 items-center">
                                                <span className="flex flex-row gap-1 font-semibold badge h-8 badge-outline badge-warning">
                                                    <ExclamationTriangleIcon className="w-6 h-6 text-warning " aria-hidden="true" />
                                                    <p className="text-neutral-content">Email is unverified</p>
                                                </span>
                                                <a className="link link-primary text-md" onClick={() => handleVerifyEmail()}>
                                                    Verify email
                                                </a>
                                            </div>
                                        }
                                        <div className="flex flex-col">
                                            <span className="text-[0.8em] font-bold">LAST LOGIN</span>
                                            <span className="">{formatDate(userAuth.metadata.lastSignInTime)}</span>
                                        </div>
                                        <div className="card-actions">
                                            <button className="btn btn-block btn-sm mt-2 h-10" onClick={() => { close(); navigate('/settings#account'); }}>
                                                Settings
                                                <FontAwesomeIcon icon={faGear} />
                                            </button>
                                            <button className="btn btn-primary text-base-300 btn-block btn-sm mt-2 h-10" onClick={() => { close(); signOut(); }}>
                                                Log out
                                                <FontAwesomeIcon icon={faRightFromBracket} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Popover.Panel>
                        </Transition>
                        {/* Overlay rendered using a portal */}
                        {open && ReactDOM.createPortal(
                            <div className="md:hidden fixed inset-0 bg-black bg-opacity-30 z-50" onClick={close}>
                            </div>,
                            document.body
                        )}
                    </>
                )}
            </Popover>
            :

            <div className="ml-2 md:mr-0 mr-2">
                <button className="btn btn-primary btn-block btn-sm h-9" onClick={() => signIn()}>
                    Sign in
                    <FontAwesomeIcon icon={faRightToBracket} />
                </button>
            </div>
    );
};

export default UserAvatar;

