import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FormSubmitButton from '../FormSubmitButton';
const ErrorPage = ({ error, errorInfo, onDismissed }) => {

    const handleBackClick = () => {
        onDismissed()
        window.location.reload()
      };

    return (
        <>
            <div className="h-screen w-full px-8 lg:px-32 md:px-16 items-center flex justify-center flex-row gap-40 fadeInUp homepage">
                <div className="relative w-full md:mt-20 mt-10">
                    <div className="relative flex flex-col md:gap-6 gap-4">
                        <div>
                            <div className="md:text-9xl text-7xl font-nunito font-extrabold text-secondary/10 scale-120">Oops!</div>
                        </div>
                        <div className="relative">
                            <div className="">
                                <h1 className="my-2 font-bold text-2xl text-neutral-content/90 font-nunito">
                                    Something went wrong
                                </h1>
                                <p className="my-2 text-neutral-content/80 md:w-2/3">We're sorry about that. Please go back and try again, and if the error persists please report this error to the developers below.</p>
                                <div className="flex md:flex-row gap-4 mt-8 items-center md:justify-start justify-start flex-row-reverse">
                                    <button className="btn btn-sm h-14 px-6 text-lg btn-secondary text-neutral" onClick={() => handleBackClick()}>Take me back</button>
                                    <div className="w-36">
                                        <FormSubmitButton
                                            formData={{ error, errorInfo }}
                                            textStates={{ success: 'Reported!', default: 'Report error', error: 'Error reporting' }}
                                            primaryColor={'btn-neutral'}
                                            successColor={'btn-success'}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:flex md:flex hidden opacity-70">
                    <img src="/svg/error.svg" alt="Data not found" width="400" />
                </div>
            </div>
        </>
    );
};

export default ErrorPage;
