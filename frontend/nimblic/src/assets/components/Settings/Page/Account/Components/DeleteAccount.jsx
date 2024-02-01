import React, { useState, useContext } from 'react';
import UserManager from '../../../../../services/user/userManager';
import { useModal } from '../../../../general/Modal/ModalContext'
import { useNavigate } from 'react-router-dom';
import { AlertContext } from '../../../../general/Alert/AlertContext';
import { getCurrentTime } from 'src/utils/textFormat';

const DeleteAccount = () => {
    const { openModal, closeModal, setModalActions } = useModal();
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false);
    const { setSuccessMessage, setErrorMessage } = useContext(AlertContext);

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

    const deleteAccount = async () => {

        setModalActions(["Cancel", ["Delete"]])

        const confirm =  async () => {
            try {
                setModalActions(["Cancel", [<div key={123} className="loading loading-sm loading-spinner"></div>]])
                
                await UserManager.deleteUser()

                setSuccessMessage({
                    type: "success",
                    short: `Successfully deleted account`,
                    long: `Your account has been deleted successfully. Sad to see you leave, but we hope to see you again some time in the future!`,
                    time: getCurrentTime(),
                });

                navigate('/')
            } catch (error) {
                console.log("del acc err")
                if (error.code == 'auth/requires-recent-login') {
                    handleReauthentication()
                    setLoading(false)
                    return;
                } else {
                    setErrorMessage({
                        type: "error",
                        short: "Error deleting account",
                        long: getFirebaseErrorMessage(error),
                        details: error,
                        time: getCurrentTime(),
                    });
                }
            } finally {
                setLoading(false)
                closeModal()
            }
        }

        openModal(
            <>
                <div className="flex flex-col items-start px-4">
                    <h3 className="font-bold md:text-2xl text-xl mr-4">Confirm account deletion</h3>
                    <p className="py-4 md:h-40 h-32 flex items-center md:text-xl text-md">You are about to delete your account forever. This operation cannot be undone.</p>
                </div>
            </>,
            () => confirm()
        );

    }



    return (
        <div className="flex flex-col md:items-end items-center w-full">
            <div className="card md:w-80 w-full">
                <div className="card-body w-full flex md:items-end items-center">
                    <button className="btn btn-error w-44 md:w-60" onClick={deleteAccount}>Delete account</button>
                </div>
            </div>
        </div>

    );
};

export default DeleteAccount;
