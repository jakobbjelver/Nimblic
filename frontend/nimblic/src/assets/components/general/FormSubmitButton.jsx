// FormSubmitButton.js
import React, { useState } from 'react';
import { PaperAirplaneIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { submitFormData } from '../../../utils/submitUtil';
import UserManager from '../../services/user/userManager';

const FormSubmitButton = ({
  endpoint,
  formData,
  textStates = {},
  onBeforeSubmit,
  onAfterSubmit,
  primaryColor = 'btn-primary', // default color if not provided
  successColor = 'btn-secondary',
  errorColor = 'btn-error'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState(false);

  const buttonColor = isLoading ? primaryColor : sendSuccess ? successColor : sendError ? errorColor : primaryColor;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (onBeforeSubmit && !onBeforeSubmit()) {
      // onBeforeSubmit returned false, indicating validation failed
      return;
    }

    setIsLoading(true);
    //await UserManager.waitForUserLoad()

    var response;
    let userAuth = UserManager.getUserAuth()
    let additionalMetadata = 'None'

    if (userAuth) {
      additionalMetadata = {
        username: userAuth.displayName || userAuth.email,
        phoneNumber: userAuth.phoneNumber,
        accountCreationDate: userAuth.metadata.creationTime,
        lastSignInDate: userAuth.metadata.lastSignInTime,
        providerData: userAuth.providerData,
        uid: userAuth.uid
      }
    }

    try {

      let formattedFormData = typeof formData === 'string' ? JSON.parse(formData) : formData;
      response = await submitFormData(endpoint, formattedFormData, additionalMetadata);

      if (response && (response.ok || response.status === 300)) {
        setSendSuccess(true);
        setTimeout(() => setSendSuccess(false), 3000);
      } else {
        setSendError(true);
        setTimeout(() => setSendError(false), 3000);
      }
    } catch (error) {
      console.error(error)
      setSendError(true);
      setTimeout(() => setSendError(false), 3000);
    } finally {
      setIsLoading(false);
      if (onAfterSubmit && response) {
        onAfterSubmit(response.ok, response);
      }
    }
  };

  return (
    <button
    className={`btn ${buttonColor ? '' : 'text-base-300'} flex-nowrap w-full whitespace-nowrap disabled:bg-opacity-70 h-10 btn-sm ${buttonColor}`}
    type="submit"
      onClick={handleSubmit}
      disabled={isLoading}>
      {!isLoading ? (
        sendSuccess ? (
          <>
            <span className="text-base-300">{textStates.success || 'Sent!'}</span>
            <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
          </>
        ) : sendError ? (
          <>
            <span>{textStates.error || 'Error'}</span>
            <ExclamationTriangleIcon className="h-4 w-4" aria-hidden="true" />
          </>
        ) : (
          <>
            <span className={`${buttonColor == 'btn-primary' ? 'text-base-300' : ''}`}>{textStates.default || 'Send'}</span>
            <PaperAirplaneIcon className={`h-4 w-4 ${buttonColor == 'btn-primary' ? 'text-base-300' : ''}`} aria-hidden="true" />
          </>
        )
      ) : (
        <div className="loading loading-spinner loading-sm text-base-300"></div>
      )}
    </button>
  );
};

export default FormSubmitButton;
