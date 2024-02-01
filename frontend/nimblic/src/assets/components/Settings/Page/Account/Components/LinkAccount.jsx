import React, { useState, useEffect, useContext } from 'react';
import UserManager from '../../../../../services/user/userManager';
import { AlertContext } from '../../../../general/Alert/AlertContext';
import { getCurrentTime } from 'src/utils/textFormat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { LinkIcon, CheckCircleIcon } from '@heroicons/react/20/solid'

const LinkAccount = ({ userAuth }) => {

    if (!userAuth) return

    const [isLinked, setLinked] = useState({
        google: false,
        github: false,
        microsoft: false
    });

    const [isLinkedLoading, setLinkedLoading] = useState({
        google: false,
        github: false,
        microsoft: false
    });

    const { setErrorMessage, setSuccessMessage } = useContext(AlertContext);
    useEffect(() => {
        if (userAuth) {
            // Reset linked state for all providers
            setLinked({
                google: false,
                github: false,
                microsoft: false
            });

            if (!userAuth.providerData) return

            console.log("newUserAuth.providerData[0]", userAuth.providerData[0])

            // Update linked state based on providerData
            userAuth.providerData.forEach(provider => {
                switch (provider.providerId) {
                    case 'google.com':
                        setLinked(prevState => ({ ...prevState, google: true }));
                        break;
                    case 'github.com':
                        setLinked(prevState => ({ ...prevState, github: true }));
                        break;
                    case 'microsoft.com':
                        setLinked(prevState => ({ ...prevState, microsoft: true }));
                        break;
                    default:
                        break;
                }
            });
        }
    }, [userAuth]);

    const handleUnlinkAccount = async (providerName) => {

        if (userAuth.providerData.length <= 1) {
            setErrorMessage({
                type: "error",
                short: "Error unlinking account",
                long: `You cannot unlink your only provider. Please link with another provider or add a password to continue.`,
                time: getCurrentTime(),
            });
            return;
        }

        let result;

        if (providerName == 'Google') {
            setLinkedLoading(prevState => ({ ...prevState, google: true }));
            result = await UserManager.unlinkGoogleAccount(userAuth);
            if (result) setLinked(prevState => ({ ...prevState, google: false }));
        } else if (providerName == 'Microsoft') {
            setLinkedLoading(prevState => ({ ...prevState, microsoft: true }));
            result = await UserManager.unlinkMicrosoftAccount(userAuth);
            if (result) setLinked(prevState => ({ ...prevState, microsoft: false }));
        } else if (providerName == 'GitHub') {
            setLinkedLoading(prevState => ({ ...prevState, github: true }));
            result = await UserManager.unlinkGithubAccount(userAuth);
            if (result) setLinked(prevState => ({ ...prevState, github: false }));
        }

        if (result) {
            setSuccessMessage({
                type: "success",
                short: `Successfully unlinked with ${providerName} account`,
                time: getCurrentTime(),
            });
        } else {
            console.log("Error unlinking account!")
            setErrorMessage({
                type: "error",
                short: `Error unlinking ${providerName} account`,
                long: `Something went wrong when unlinking your ${providerName} account. Please try again later.`,
                time: getCurrentTime(),
            });
        }

        setLinkedLoading({
            google: false,
            github: false,
            microsoft: false
        });
    };

    const handleLinkAccount = async (providerName) => {
        if (!userAuth.providerData) return

        let result;

        if (providerName == 'Google') {
            setLinkedLoading(prevState => ({ ...prevState, google: true }));
            result = await UserManager.linkGoogleAccount(userAuth);
            if (result) setLinked(prevState => ({ ...prevState, google: true }));
        } else if (providerName == 'Microsoft') {
            setLinkedLoading(prevState => ({ ...prevState, microsoft: true }));
            result = await UserManager.linkMicrosoftAccount(userAuth);
            if (result) setLinked(prevState => ({ ...prevState, microsoft: true }));
        } else if (providerName == 'GitHub') {
            setLinkedLoading(prevState => ({ ...prevState, github: true }));
            result = await UserManager.linkGithubAccount(userAuth);
            if (result) setLinked(prevState => ({ ...prevState, github: true }));
        }

        if (result) {
            setSuccessMessage({
                type: "success",
                short: `Successfully linked with ${providerName} account`,
                time: getCurrentTime(),
            });
        } else {
            console.log("Error linking account!")
            setErrorMessage({
                type: "error",
                short: `Unable to link with ${providerName} account`,
                long: `Something went wrong when linking your account. If your account is set up as a ${providerName} account, then this operation is impossible. Please try again later.`,
                time: getCurrentTime(),
            });
        }

        setLinkedLoading({
            google: false,
            github: false,
            microsoft: false
        });
    };

    return (
        <div className="flex flex-col md:items-end items-center justify-end gap-3 w-full md:mb-0 mb-6">
            <div className="mt-0 grid grid-cols-1 gap-3 w-5/6 md:w-full md:place-items-end place-items-center">
                <div className="flex flex-row gap-3 items-center">
                    <button
                        onClick={isLinked.google ? () => handleUnlinkAccount('Google') : () => handleLinkAccount('Google')}
                        className="inline-flex ml-10 w-44 md:w-60 btn border-neutral-content/30 shadow-sm h-10 btn-sm btn-ghost"
                    >
                        {isLinkedLoading.google ?
                            <div className="loading loading-spinner"></div>
                            : <img src="https://img.icons8.com/color/48/000000/google-logo.png" className="h-5 w-5" alt="Google" />
                        }
                        <span className="">{isLinked.google ? 'Unlink' : 'Link'}</span>

                    </button>
                    {isLinked.google ?
                        <CheckCircleIcon className="h-6 w-6 text-secondary" aria-hidden="true" />
                        :
                        <LinkIcon className="h-5 w-6" aria-hidden="true" />

                    }
                </div>
                <div className="flex flex-row gap-3 items-center">
                    <button
                        onClick={isLinked.github ? () => handleUnlinkAccount('GitHub') : () => handleLinkAccount('GitHub')}
                        className="inline-flex ml-10 w-44 md:w-60 btn border-neutral-content/30 shadow-sm h-10 btn-sm btn-ghost"
                    >
                        {isLinkedLoading.github ?
                            <div className="loading loading-spinner"></div>
                            : <FontAwesomeIcon icon={faGithub} size="xl" />
                        }
                        <span className="">{isLinked.github ? 'Unlink' : 'Link'}</span>

                    </button>
                    {isLinked.github ?
                        <CheckCircleIcon className="h-6 w-6 text-secondary" aria-hidden="true" />
                        :
                        <LinkIcon className="h-5 w-6" aria-hidden="true" />

                    }
                </div>
                <div className="flex flex-row gap-3 items-center">
                    <button
                        onClick={isLinked.microsoft ? () => handleUnlinkAccount('Microsoft') : () => handleLinkAccount('Microsoft')}
                        className="inline-flex ml-10 w-44 md:w-60 btn border-neutral-content/30 shadow-sm h-10 btn-sm btn-ghost"
                    >
                        {isLinkedLoading.microsoft ?
                            <div className="loading loading-spinner"></div>
                            : <img src="https://asset.brandfetch.io/idchmboHEZ/iduap5ndHF.svg" className="h-5 w-5" alt="Microsoft" />
                        }
                        <span className="">{isLinked.microsoft ? 'Unlink' : 'Link'}</span>

                    </button>
                    {isLinked.microsoft ?
                        <CheckCircleIcon className="h-6 w-6 text-secondary" aria-hidden="true" />
                        :
                        <LinkIcon className="h-5 w-6" aria-hidden="true" />

                    }
                </div>
            </div>
        </div>


    );
};

export default LinkAccount;
