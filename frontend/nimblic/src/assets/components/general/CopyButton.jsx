import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline'

const CopyButton = ({ copyText, color, labelText, icon}) => {
    const [copySuccess, setCopySuccess] = useState(false);
    const [copySuccessDelay, setCopySuccessDelay] = useState(false);

    // Handle copying to clipboard
    const copyToClipboard = async () => {
        setCopySuccess(true);
        setCopySuccessDelay(true);
        try {
            await navigator.clipboard.writeText(copyText);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000); // Reset success message after 3 seconds
            setTimeout(() => setCopySuccessDelay(false), 4000); // Reset success message after 3 seconds
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <div className={`tooltip ${color ? '' : 'tooltip-primary'} ${copySuccess ? "tooltip-open" : ""}`} data-tip={`${copySuccessDelay ? "Copied!" : "Copy"}`}>

            <button
                className={`btn w-fit ${color ? 'btn-neutral text-neutral-content/80' : 'btn-primary'} join-item`}
                onClick={copyToClipboard} // Updated event handler
            >             
                <label className="swap swap-rotate">
                    <input
                        type="checkbox"
                        className="hidden"
                        checked={copySuccess}
                        readOnly
                    />
                    {icon || <DocumentDuplicateIcon className="h-5 w-5 swap-off" aria-hidden="true" />}
                    <CheckIcon className="h-5 w-5 swap-on" aria-hidden="true" />
                </label>
                {labelText}
            </button>
        </div>
    )

}

export default CopyButton;
