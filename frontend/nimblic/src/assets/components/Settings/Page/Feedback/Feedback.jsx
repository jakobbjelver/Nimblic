import React, { useEffect, useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faXTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import FormSubmitButton from '../../../general/FormSubmitButton';
import { faCopy, faCheck, faEnvelope, faHeart } from '@fortawesome/free-solid-svg-icons';

import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  EmailShareButton,
} from 'react-share';
import CopyButton from '../../../general/CopyButton';


const Feedback = () => {
  const [copySuccess, setCopySuccess] = useState(false);
  const title = 'Nimblic - fast and easy EDA';
  const copyText = 'https://nimblic.app';
  const shareUrl = 'https://nimblic.app';
  const [formData, setFormData] = useState('');
  const [placeholder, setPlaceholder] = useState('Enter feedback here');

  // Handle copying to clipboard
  const copyToClipboard = async () => {
    setCopySuccess(true);
    try {
      await navigator.clipboard.writeText(copyText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000); // Reset success message after 3 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleFeedbackChange = (e) => {
    setFormData(e.target.value);
  };

  const handleFormCleanup = (success, response) => {
    if (success) {
      setPlaceholder('Thank you for your feedback!');
      setTimeout(() => setPlaceholder('Enter feedback here'), 3000); // Reset success message after 3 seconds
    }
  };

  return (
    <div className="md:mb-40 relative w-full max-w-screen-lg fadeInUp overflow-x-hidden isolate overflow-hidden bg-neutral py-16 sm:py-24 lg:py-16 rounded-xl shadow-md">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex lg:flex-row flex-col gap-12">
          <div className="w-full">
            <h2 className="md:text-3xl text-xl font-bold font-nunito tracking-tight ml-4">Tell us what you think</h2>
            <p className="mt-4 ml-4 mr-8 md:text-lg lg:tracking-normal tracking-tight lg:leading-8 leading-snug">
              All suggestions are appreciated to make the service better, we would love to hear your feedback.
            </p>
            <form className="mt-6 flex flex-col gap-5 items-center max-w-md gap-x-4">
              <textarea
                required
                rows={3}
                className="min-w-0 w-full flex-auto rounded-md border-0 px-3.5 py-2 bg-base-300 shadow-sm ring-1 ring-inset ring-neutral-content/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder={placeholder}
                value={formData}
                onChange={handleFeedbackChange}
              />
              <div className="w-40">
                <FormSubmitButton
                  formData={{text: formData }}
                  textStates={{ success: 'Sent!', default: 'Send', error: 'Error' }}
                  onAfterSubmit={handleFormCleanup}
                />
              </div>
            </form>
          </div>
          <dl className="grid grid-cols-1 lg:w-max w-full lg:mt-12 mt-4 gap-x-10 lg:gap-y-10 gap-y-16 sm:grid-cols-2 lg:pt-2">
            <div className="flex flex-col lg:items-start items-center">
              <div className="flex flex-row justify-between w-full lg:pr-10 px-6 lg:px-0">
                <div className="flex items-center justify-center rounded-md bg-secondary/40 p-2 ring-1 h-12 w-12 ring-secondary/60 hover:ring-secondary/90 hover:scale-105 transition-all duration-200">
                  <FacebookShareButton url={shareUrl} quote={title}>
                    <FontAwesomeIcon icon={faFacebook} size="2xl" className="text-white/90" />
                  </FacebookShareButton>
                </div>
                <div className="flex items-center justify-center rounded-md bg-secondary/40 p-2 ring-1 h-12 w-12 ring-secondary/60 hover:ring-secondary/90 hover:scale-105 transition-all duration-200">
                  <LinkedinShareButton url={shareUrl} quote={title}>
                    <FontAwesomeIcon icon={faLinkedin} size="2xl" className="text-white/90" />
                  </LinkedinShareButton>
                </div>
                <div className="flex items-center justify-center rounded-md bg-secondary/40 p-2 ring-1 h-12 w-12 ring-secondary/60 hover:ring-secondary/90 hover:scale-105 transition-all duration-200">
                  <TwitterShareButton url={shareUrl} quote={title}>
                    <FontAwesomeIcon icon={faXTwitter} size="2xl" className="text-white/90" />
                  </TwitterShareButton>
                </div>
                <div className="flex items-center justify-center rounded-md bg-secondary/40 p-2 ring-1 h-12 w-12 ring-secondary/60 hover:ring-secondary/90 hover:scale-105 transition-all duration-200">
                  <EmailShareButton url={shareUrl} quote={title}>
                    <FontAwesomeIcon icon={faEnvelope} size="2xl" className="text-white/90"/>
                  </EmailShareButton>
                </div>
              </div>
              <dt className="mt-10 text-xl font-semibold font-nunito tracking-tight">Spread the word!</dt>
              <dd className="mt-2 leading-7 text-neutral-content/50">
                <div className="join">
                  <input
                    type="text"
                    value={copyText}
                    className="min-w-0 flex-auto rounded-l-md border-0 px-3.5 py-2 bg-base-300 shadow-sm ring-1 ring-inset ring-neutral-content/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    readOnly={true}
                  />
                  <CopyButton copyText={copyText}/>
                </div>
              </dd>
            </div>
            <div className="flex flex-col items-start">
              <button className="flex flex-row prose mr-5 pb-2 items-center justify-center">
                <div className="logo-sm"></div>
                <h1 className="font-nunito text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary text-3xl">
                  Nimblic
                </h1>
              </button>
              <dt className="mt-4 font-semibold ">Made with <FontAwesomeIcon icon={faHeart} /> in Sweden</dt>
              <dd className="mt-2 leading-7 text-neutral-content/80">
                Our mission is to continue the quest for understandable data. Built with the user in mind, here in Sweden.
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6" aria-hidden="true">
        <div
          className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-secondary to-primary opacity-30"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </div>
  )
};

export default Feedback;

