import React, { useState, useEffect, useContext } from 'react';
import UserManager from '../../../../services/user/userManager';
import LinkAccount from './Components/LinkAccount';
import AccountType from './Components/AccountType';
import DeleteAccount from './Components/DeleteAccount';
import AccountCredentials from './Components/AccountCredentials';
import RecentUploads from './Components/RecentUploads';
import { lineBreakText } from '../../../../../utils/textFormat';
const AccountManagement = () => {
    const [userAuth, setUserAuth] = useState(UserManager.getUserAuth());
    const [userData, setUserData] = useState(UserManager.getUserData());
    const [username, setUserName] = useState(null);

    useEffect(() => {
        const handleUserDataChange = (newUserData) => {
            setUserData(newUserData);
        };

        const handleUserAuthChange = (newUserAuth) => {
            setUserAuth(newUserAuth);
            if (newUserAuth) {
                setUserName(lineBreakText(newUserAuth.displayName || newUserAuth.email, 50))
            }
        };

        UserManager.subscribeToUserDataUpdates(handleUserDataChange);
        UserManager.subscribeToUserAuth(handleUserAuthChange);

        return () => {
            UserManager.unsubscribeFromUserDataUpdates(handleUserDataChange);
            UserManager.unsubscribeFromUserAuth(handleUserAuthChange);
        };
    }, []);

    return (
        <div className="card w-full max-w-4xl h-fit bg-base-200 fadeInUp md:mb-40">
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
                            <h3 className="text-2xl font-nunito font-bold break-all">{username}</h3>
                        </div>
                    </h2>
                    <div className="flex flex-col xl:items-start lg:items-center items-center justify-evenly gap-8 mx-0 mt-8">
                        <div className="flex flex-col md:px-12 gap-8">
                            <div className="flex md:flex-row flex-col items-top justify-evenly md:gap-8">
                                <div className="md:w-2/5 flex flex-col items-center md:items-start h-fit">
                                    <p className="text-md font-bold font-nunito mt-0.5 mb-1">Account type</p>
                                    <p className="text-sm text-start md:w-auto w-full">See the privileges associated with your account, whether it's a free, premium, or custom role.</p>
                                </div>
                                <div className="md:w-3/5 h-20 mt-6">
                                    {userData && <AccountType userData={userData} />}
                                </div>
                            </div>
                            <div className="flex md:flex-row flex-col items-top justify-evenly md:gap-8">
                                <div className="md:w-2/5 flex flex-col items-center md:items-start h-fit">
                                    <p className="text-md font-bold font-nunito mt-0.5 text-start mb-1">Credentials</p>
                                    <p className="text-sm text-start md:w-auto w-full">If you have connected with an external provider, you can set an email and a password here in order to be able to log in without the provider. </p>
                                </div>
                                <div className="md:w-3/5 mt-3">
                                    <AccountCredentials userAuth={userAuth}/>
                                </div>
                            </div>
                            <div className="flex md:flex-row flex-col items-top justify-evenly md:gap-8">
                                <div className="md:w-2/5 flex flex-col items-center md:items-start h-fit">
                                    <p className="text-md font-bold font-nunito mt-0.5 mb-1">Recent uploads</p>
                                    <p className="text-sm text-start md:w-auto w-full">This list helps you monitor your upload frequency, letting you know how often you upload.</p>
                                </div>
                                <div className="md:w-3/5 mt-6">
                                    {userData && <RecentUploads userData={userData} />}
                                </div>
                            </div>
                            <div className="flex md:flex-row flex-col items-top justify-evenly md:gap-8">
                                <div className="md:w-2/5 flex flex-col items-center md:items-start h-fit">
                                    <p className="text-md font-bold font-nunito mt-0.5 mb-1">Link account</p>
                                    <p className="text-sm text-start md:w-auto w-full">Link your account with external providers to easier access your account.</p>
                                </div>
                                <div className="md:w-3/5 mt-6">
                                    {userAuth && <LinkAccount userAuth={userAuth} />}
                                </div>
                            </div>

                            <div className="flex md:flex-row flex-col items-top justify-evenly md:gap-8">
                                <div className="md:w-2/5 flex flex-col items-center md:items-start h-fit">
                                    <p className="text-md font-bold font-nunito mt-0.5 mb-1">Delete account</p>
                                    <p className="text-sm text-start md:w-auto w-full">No longer want to use Nimblic? You can delete your account here. This action is not reversible. All information related to this account will be deleted permanently.</p>
                                </div>
                                <div className="md:w-3/5 md:mt-2">
                                    <DeleteAccount />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}
        </div>
    );
};

export default AccountManagement;
