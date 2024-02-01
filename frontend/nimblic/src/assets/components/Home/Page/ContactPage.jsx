import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FormSubmitButton from '../../general/FormSubmitButton';

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
    const [validationError, setValidationError] = useState(false);

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
        console.log("setting error!", !formData.email || !agreed)
        setValidationError(!formData.email || !agreed);
        return formData.email && agreed;
    };

    const handleFormCleanup = (success, response) => {
        if (success) {
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
            <form className="mx-auto md:mt-16 mt-8 max-w-xl sm:mt-20">
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                    <label className="form-control w-full max-w-xs">
                        <div className="label">
                            <span className="label-text font-semibold">First name</span>
                        </div>
                        <input type="text" className="input input-bordered w-full max-w-xs bg-base-200 h-10"
                            onChange={handleInputChange}
                            name="firstName"
                            value={formData.firstName}

                        />
                    </label>
                    <label className="form-control w-full max-w-xs">
                        <div className="label">
                            <span className="label-text font-semibold">Last name</span>
                        </div>
                        <input type="text" className="input input-bordered w-full max-w-xs bg-base-200 h-10"
                            onChange={handleInputChange}
                            name="lastName"
                            value={formData.lastName}
                        />
                    </label>
                    <label className="form-control w-full sm:col-span-2">
                        <div className="label">
                            <span className="label-text font-semibold">Company</span>
                        </div>
                        <input type="text" className="input input-bordered w-full bg-base-200 h-10"
                            onChange={handleInputChange}
                            name="company"
                            value={formData.company}
                        />
                    </label>
                    <label className={`form-control w-full sm:col-span-2 ${validationError && !formData.email ? 'text-error' : ''}`}>
                        <div className="label">
                            <span className="label-text font-semibold">Email</span>
                        </div>
                        <input type="text" className={`input input-bordered w-full bg-base-200 h-10 ${validationError && !formData.email ? 'border-error' : ''}`}
                            onChange={handleInputChange}
                            name="email"
                            value={formData.email} />
                    </label>


                    <label className="form-control w-full sm:col-span-2">
                        <div className="label">
                            <span className="label-text font-semibold">Phone number</span>
                        </div>
                        <div className="join w-full sm:col-span-2 h-10">
                            <select
                                className="select select-bordered select-sm join-item h-10"
                                name="countryCode"
                                value={formData.countryCode}
                                onChange={handleInputChange}>
                                <option value="SE">SE</option>
                                <option value="US">US</option>
                                <option value="DK">DK</option>
                                <option value="DE">DE</option>
                            </select>
                            <input className="input input-bordered join-item w-full bg-base-200 h-10"
                                onChange={handleInputChange}
                                name="phoneNumber"
                                value={formData.phoneNumber}
                            />
                        </div>
                    </label>


                    <label className="form-control sm:col-span-2">
                        <div className="label">
                            <span className="label-text font-semibold">Message</span>
                        </div>
                        <textarea
                            name="message"
                            className="textarea textarea-bordered h-24 bg-base-200"
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
                    <FormSubmitButton
                        formData={{ text: formData }}
                        textStates={{ success: 'We will be in touch!', default: 'Let\'s talk', error: 'Error sending message' }}
                        onBeforeSubmit={validateForm}
                        onAfterSubmit={handleFormCleanup}
                    />
                </div>
            </form >
        </div >
    )
}
