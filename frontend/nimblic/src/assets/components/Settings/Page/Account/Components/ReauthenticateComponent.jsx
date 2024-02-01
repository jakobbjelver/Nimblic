import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import React, { useState } from 'react';
import UserManager from '../../../../../services/user/userManager';
import { getFirebaseErrorMessage } from '../../../../../../utils/errorUtil';

const ReauthenticateComponent = ({ onSuccess, providerId }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isError, setError] = useState(false);

    const signIn = async () => {
        try {
            setLoading(true)
            await UserManager.reauthenticate(currentPassword, providerId)
            setLoading(false)
            onSuccess()
        } catch (error) {
            console.error(error)
            setError(true)
            setMessage(getFirebaseErrorMessage(error))
            setLoading(false)
        }
    }

    const providers = {
        "password": { name: 'password', icon: <FontAwesomeIcon icon={faRightToBracket} /> },
        "google.com": { name: 'Google', icon: <img src="https://img.icons8.com/color/48/000000/google-logo.png" className="h-5 w-5 m-0 p-0" alt="Google" /> },
        "github.com": { name: 'Github', icon: <FontAwesomeIcon icon={faGithub} /> },
        "microsoft.com": { name: 'Microsoft', icon: <img src="https://asset.brandfetch.io/idchmboHEZ/iduap5ndHF.svg" className="h-5 w-5" alt="Microsoft" /> },
    };

    const [message, setMessage] = useState(
        providerId == 'password' ? 'Enter your current password to confirm your changes.'
            : `Sign in with ${providers[providerId].name} to confirm your changes.`
    );

    return (
        <div className="flex flex-col px-4 w-full">
            <h3 className="font-bold md:text-2xl text-xl text-start">Sign in to confirm changes</h3>
            <p className={`md:py-4 pt-4 flex text-start md:text-md text-sm ${isError ? 'text-error' : ''}`}>{message}</p>
            <div className="w-fit flex flex-col items-center mb-8 mx-auto">
                {providerId == 'password' &&
                    <>
                        <div className="flex flex-col w-full items-start">
                            <label htmlFor="password" className="text-sm font-medium mt-4">
                                Current password
                            </label>
                            <input
                                id="currrentPassword"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="input h-10 input-bordered md:w-72 w-full mt-2 bg-base-300"
                                placeholder="Current password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                        </div>

                    </>
                }
                <button
                    onClick={() => signIn()}
                    className={`inline-flex mt-3 btn shadow-md h-10 btn-lg ${providerId == 'password' ? 'w-32' : 'w-full'}`}
                    disabled={!currentPassword && providerId == 'password' ? true : false}
                >
                    {loading ?
                        <div className="loading loading-spinner loading-sm"></div>
                        : providers[providerId].icon
                    }
                    <span className="">Sign in</span>
                </button>
            </div>
        </div>
    )

}

export default ReauthenticateComponent