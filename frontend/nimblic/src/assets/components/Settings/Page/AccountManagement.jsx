import React, { useState, useEffect, useContext } from 'react';
import UserManager from '../../../services/user/userManager';
import { useModal } from '../../general/Modal/ModalContext'
import { useNavigate } from 'react-router-dom';
import { AlertContext } from '../../general/Alert/AlertContext';
import { getCurrentTime } from 'src/utils/textFormat';

const AccountManagement = () => {
    const [userAuth, setUserAuth] = useState(UserManager.getUserAuth());
    const [userData, setUserData] = useState(UserManager.getUserData());
    const [username, setUserName] = useState(null);
    const [isGoogleLinked, setGoogleLinked] = useState(false);
    const [isLoadingLinked, setLoadingLinked] = useState(false);
    const { openModal, closeModal, setModalActions } = useModal();
    const navigate = useNavigate();
    const { setErrorMessage, setSuccessMessage } = useContext(AlertContext);

    useEffect(() => {
        const handleUserDataChange = (newUserData) => {
            setUserData(newUserData);
        };

        const handleUserAuthChange = (newUserAuth) => {
            setUserAuth(newUserAuth);
            if (newUserAuth) {
                setUserName(newUserAuth.displayName || newUserAuth.email)

                if (newUserAuth.providerData[0].providerId == 'password') {
                    setGoogleLinked(false)
                } else {
                    setGoogleLinked(true)
                }
            }
        };

        UserManager.subscribeToUserDataUpdates(handleUserDataChange);
        UserManager.subscribeToUserAuth(handleUserAuthChange);

        return () => {
            UserManager.unsubscribeFromUserDataUpdates(handleUserDataChange);
            UserManager.unsubscribeFromUserAuth(handleUserAuthChange);
        };
    }, []);

    const deleteAccount = () => {

        setModalActions(["Cancel", ["Delete"]])

        const confirm = () => {
            try {
                UserManager.deleteUser()
            } catch(error) {

                setModalActions(["Cancel"])
                openModal(
                    <>
                        <div className="flex flex-col items-start px-4">
                            <h3 className="font-bold text-2xl">Error deleting account</h3>
                            <p className="py-4 h-40 flex items-center text-xl">Something went wrong when deleting your account. Please try to logging out and logging in and try again.</p>
                        </div>
                    </>
                );
            }
            navigate('/')
            
            closeModal()
        }

        openModal(
            <>
                <div className="flex flex-col items-start px-4">
                    <h3 className="font-bold text-2xl">Confirm account deletion</h3>
                    <p className="py-4 h-40 flex items-center text-xl">You are about to delete your account forever. This operation cannot be undone.</p>
                </div>
            </>,
            () => confirm()
        );

    }

    const handleUnlinkGoogle = async () => {
        setLoadingLinked(true)
        let result = await UserManager.unlinkGoogleAccount(userAuth);

        if(result) {
            setGoogleLinked(false)
            setLoadingLinked(false)
            setSuccessMessage({
                type: "success",
                short: "Successfully unlinked Google account",
                time: getCurrentTime(),
            });
        } else {
            setErrorMessage({
                type: "error",
                short: "Error unlinking Google account",
                long: "Something went wrong when unlinking your account. Please try again later.",
                time: getCurrentTime(),
            });
            setLoadingLinked(false)
        }
    };

    const handleLinkGoogle = async () => {
        if (!userAuth.providerData) return
        setLoadingLinked(true)

        let result = await UserManager.linkGoogleAccount(userAuth);

        if(result) {
            setGoogleLinked(true)
            setLoadingLinked(false)
            setSuccessMessage({
                type: "success",
                short: "Successfully linked with Google account",
                time: getCurrentTime(),
            });
        } else {
            setErrorMessage({
                type: "error",
                short: "Unnable to unlink Google account",
                long: "Something went wrong when linking your account. If your account is set up as a google account, then this operation is impossible. Please try again later.",
                time: getCurrentTime(),
            });
            setLoadingLinked(false)
        }
    };

    return (
        <div className="card w-full h-fit bg-base-200">
            {!userData || !userAuth ?
                <div className="card-body h-80 flex items-center justify-center">
                    <div className="loading loading-spinner loading-lg"></div>
                </div>
                :
                <div className="card-body">
                    <h2 className="card-title text-md text-neutral-content/90 font-bold font-nunito">
                        <div className="flex flex-row gap-4 items-center justify-center">
                            <label tabIndex="0" className={`avatar ${userAuth ? userAuth.photoURL ? '' : 'placeholder bg-base-100 rounded-full font-sans font-medium' : 'placeholder bg-base-100 rounded-full font-sans font-medium'}`}>
                                <div className="w-12 rounded-full">
                                    {userAuth ? userAuth.photoURL ?
                                        <img src={userAuth.photoURL} />
                                        : <span className="text-md">{username ? username.charAt(0).toUpperCase() : ''}</span>
                                        : <span className="text-md">{username ? username.charAt(0).toUpperCase() : ''}</span>}
                                </div>
                            </label>
                            <h3 className="text-2xl font-nunito font-bold">{username}</h3>
                        </div>
                    </h2>
                    <div className="flex xl:flex-row lg:flex-col items-start lg:items-center justify-evenly gap-12 lg:gap-4 mx-12 lg:mx-4 mt-0">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-start justify-center gap-4">
                                <p className="text-md text-neutral-content/90 font-bold font-nunito mt-0.5">RECENT UPLOADS</p>
                                {userData.lastUploads.length === 1 ?
                                    <div className="overflow-y-scroll max-h-48">
                                        <table className="table bg-base-300 w-80">
                                            <tbody>

                                                {userData.lastUploads.map((timestamp, index) => {
                                                    // Convert Firestore Timestamp to JavaScript Date object
                                                    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);

                                                    // Format the date as a string (e.g., 'MM/DD/YYYY HH:mm')
                                                    // You can adjust the format as per your requirement
                                                    const dateString = date.toLocaleDateString("en-US", {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit'
                                                    });

                                                    return (
                                                        <tr key={index}>
                                                            <th>{index + 1}</th>
                                                            <td>{dateString}</td>
                                                        </tr>
                                                    );
                                                })}

                                            </tbody>
                                        </table>
                                    </div>
                                    :
                                    <div className="w-72 h-20 flex items-center">
                                        <p className="text-xl">No recent uploads</p>
                                    </div>
                                }
                            </div>
                        </div>
                        <div className="flex xl:flex-col lg:flex-row gap-10">
                            <div className="flex flex-col items-start justify-center w-full gap-2">
                                <p className="text-md text-neutral-content/90 font-bold font-nunito">ACCOUNT TYPE</p>
                                <div className="flex flex-row gap-4">
                                    <div className={`badge badge-lg h-8 px-3 mt-1 ${userData.accountType == 'Admin' ? 'bg-gradient-to-r from-primary to-secondary text-neutral' : userData.accountType == 'Premium' ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral' : 'bg-gradient-to-r from-slate-400 to-slate-500 text-neutral'}`}>
                                        <p className="text-xl">{userData.accountType}</p>
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        <div className="flex flex-col items-start justify-center">
                                            <p className="font-extrabold text-xs mt-1">UPLOAD LIMIT</p>
                                            <p className="font-extrabold text-xs mt-1">FILE SIZE LIMIT</p>

                                        </div>
                                        <div className="flex flex-col items-start justify-center">
                                            <p className="text-md">{userData.uploadLimit} times/day</p>
                                            <p className="text-md">{userData.fileSizeLimit} MB</p>
                                        </div>

                                    </div>
                                </div>
                            </div>
                            { /* 
                            <div className="flex flex-col gap-4 items-center">
                                <div>
                                    <label htmlFor="password" className="text-xl text-neutral-content/90 font-bold font-nunito mt-2.5 mb-3">
                                        PASSWORD
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
                                <div className="btn btn-primary btn-sm w-40">Update</div>
                            </div>
                            */ }
                            <div className="flex flex-col items-start justify-center w-fit gap-3">
                                <p className="text-md text-neutral-content/90 font-bold font-nunito">{isGoogleLinked ? 'UNLINK GOOGLE ACCOUNT' : 'LINK GOOGLE ACCOUNT'}</p>
                                <button
                                    onClick={isGoogleLinked ? handleUnlinkGoogle : handleLinkGoogle}
                                    className="w-40 btn border-neutral-content/30 shadow-sm h-12 btn-sm btn-ghost"
                                >
                                    <span className="sr-only">Sign in with Google</span>
                                    {isLoadingLinked ? 
                                    <div className="loading loading-spinner"></div>
                                    :                                     <img src="https://img.icons8.com/color/48/000000/google-logo.png" className="h-5 w-5" alt="Google" />
                                }
                                </button>
                            </div>

                        </div>
                        <div className="flex flex-col items-start">
                            <div className="card w-80">
                                <div className="card-body">
                                    <h2 className="text-md text-neutral-content/90 font-bold font-nunito">DELETE ACCOUNT</h2>
                                    <p className="text-sm">You can permanentely delete your account. This will delete all user data and sign you out immediately.</p>
                                    <button className="btn btn-error mt-2 w-40" onClick={deleteAccount}>Delete account</button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>}
        </div>
    );
};

export default AccountManagement;
