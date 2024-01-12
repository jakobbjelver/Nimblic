import React, { useState, useEffect } from 'react';
import { PaperAirplaneIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        company: '',
        email: '',
        phoneNumber: '',
        countryCode: 'SE',
        message: ''
    });
    const [agreed, setAgreed] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);
    const [sendError, setSendError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [validationError, setValidationError] = useState(false);

    const endpoint = "https://us-central1-artilas-ecbb9.cloudfunctions.net/app";
    //const endpoint = "http://localhost:3000";

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAgreementChange = (e) => {
        setAgreed(e.target.checked);
    };

    const validateForm = () => {
        return formData.email && agreed;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setValidationError(true);
            return;
        }
        setValidationError(false);
        setIsLoading(true);


        try {
            // Timestamp
            const timestamp = new Date().toISOString();

            // Language
            const language = window.navigator.language;

            // Screen Resolution
            const screenResolution = `${window.screen.width}x${window.screen.height}`;

            // Add more metadata as needed
            const metadata = {
                browserInfo: window.navigator.userAgent,
                timestamp,
                language,
                screenResolution,
            };

            const response = await fetch(`${endpoint}/submit-feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...formData, metadata })
            });

            if (response.ok || response.status === 300) {
                console.log('Form submitted successfully');
                setSendSuccess(true);
                setFormData({
                    firstName: '',
                    lastName: '',
                    company: '',
                    email: '',
                    phoneNumber: '',
                    countryCode: 'SE',
                    message: ''
                });
                setAgreed(false);
                setTimeout(() => setSendSuccess(false), 3000); // Reset success message
            } else {
                console.error('Error submitting form', response);
                setSendError(true);
                setTimeout(() => setSendError(false), 3000); // Reset error message
            }
        } catch (error) {
            console.error('Network error:', error);
            setSendError(true);
            setTimeout(() => setSendError(false), 3000); // Reset error message
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="md:mt-32 mt-24 px-6 md:py-16 md:my-12 my-8 py-12 lg:px-8 bg-base-300 rounded-2xl">
            <div className="mx-auto max-w-2xl text-center gap-4 flex flex-col">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact us</h2>
                <p className="mt-2 md:text-lg text-sm md:leading-8 text-neutral-content/80">
                    We're sure you have lots of questions and would like to get started. Go ahead and let us know how we can help you improve your EDA with Nimblic.
                </p>
                <p className="mt-2 md:text-lg text-sm md:leading-8 text-neutral-content/80">
                    Take the chance to chat about pricing, features, or provide some feedback about your latest use. Or just have a talk about how you like to do EDA!
                </p>
            </div>
            <form onSubmit={handleSubmit} className="mx-auto md:mt-16 mt-8 max-w-xl sm:mt-20">
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                    <label className="form-control w-full max-w-xs">
                        <div className="label">
                            <span className="label-text font-semibold">First name</span>
                        </div>
                        <input type="text" className="input input-bordered w-full max-w-xs bg-base-300"
                            onChange={handleInputChange}
                            name="firstName"
                            value={formData.firstName}

                        />
                    </label>
                    <label className="form-control w-full max-w-xs">
                        <div className="label">
                            <span className="label-text font-semibold">Last name</span>
                        </div>
                        <input type="text" className="input input-bordered w-full max-w-xs bg-base-300"
                            onChange={handleInputChange}
                            name="lastName"
                            value={formData.lastName}
                        />
                    </label>
                    <label className="form-control w-full sm:col-span-2">
                        <div className="label">
                            <span className="label-text font-semibold">Company</span>
                        </div>
                        <input type="text" className="input input-bordered w-full bg-base-300"
                            onChange={handleInputChange}
                            name="company"
                            value={formData.company}
                        />
                    </label>
                    <label className={`form-control w-full sm:col-span-2 ${validationError && !formData.email ? 'text-error' : ''}`}>
                        <div className="label">
                            <span className="label-text font-semibold">Email</span>
                        </div>
                        <input type="text" className={`input input-bordered w-full bg-base-300 ${validationError && !formData.email ? 'border-error' : ''}`}
                            onChange={handleInputChange}
                            name="email"
                            value={formData.email} />
                    </label>


                    <label className="form-control w-full sm:col-span-2">
                        <div className="label">
                            <span className="label-text font-semibold">Phone number</span>
                        </div>
                        <div className="join w-full sm:col-span-2">
                            <select
                                className="select select-bordered join-item"
                                name="countryCode"
                                value={formData.countryCode}
                                onChange={handleInputChange}>
                                <option value="SE">SE</option>
                                <option value="US">US</option>
                                <option value="DK">DK</option>
                                <option value="DE">DE</option>
                            </select>
                            <input className="input input-bordered join-item w-full bg-base-300"
                                onChange={handleInputChange}
                                name="phoneNumber"
                                value={formData.phoneNumber}
                            />
                        </div>
                    </label>


                    <label className="form-control sm:col-span-2">
                        <div className="label">
                            <span className="label-text">Message</span>
                        </div>
                        <textarea
                            name="message"
                            className="textarea textarea-bordered h-24 bg-base-300"
                            onChange={handleInputChange}
                            value={formData.message}
                        ></textarea>
                    </label>
                    <div className="form-control sm:col-span-2 flex items-start justify-center">
                        <label className={`label cursor-pointer ${validationError && !agreed ? 'text-error' : ''}`}>
                            <input type="checkbox" className="toggle toggle-sm toggle-primary mr-2"
                                onChange={handleAgreementChange}
                                checked={agreed} />
                            <span className={`label-text flex-0 ${validationError && !agreed ? 'text-error' : ''}`}> By selecting this, you agree to our
                                <Link to="/data-protection-policy" className="font-semibold text-primary ml-1">
                                    privacy&nbsp;policy
                                </Link>
                            </span>
                        </label>
                    </div>
                </div >
                <div className="mt-2 flex flex-col items-center text-error">
                    <p className={`h-10 text-sm transition-all duration-100 ${validationError ? 'opacity-100' : 'opacity-0'}`}>Please fill in the required fields</p>
                    <button
                        className={`btn font-bold w-full text-base-300 ${sendSuccess ? "btn-secondary" : sendError ? "btn-error" : "btn-primary"}`}
                        type="submit">
                        {!isLoading ? (
                            sendSuccess ? (
                                <>
                                    <span>We will be in touch!</span>
                                    <CheckCircleIcon className="h-4 w-4 text-base-300" aria-hidden="true" />
                                </>
                            ) : (
                                sendError ? (
                                    <>
                                        <span>Error sending message</span>
                                        <ExclamationTriangleIcon className="h-4 w-4 text-base-300" aria-hidden="true" />
                                    </>
                                ) : (
                                    (
                                        <>
                                            <span>Let's talk</span>
                                            <PaperAirplaneIcon className="h-4 w-4 text-base-300" aria-hidden="true" />
                                        </>
                                    )
                                )
                            )
                        ) : (
                            <div className="loading loading-spinner loading-sm"></div>
                        )}
                    </button>
                </div>
            </form >
        </div >
    )
}
