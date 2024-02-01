import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';

const CopyButton = ({ copyText, color}) => {
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
                className={`btn ${color ? 'btn-neutral text-neutral-content/80' : 'btn-primary'} join-item`}
                onClick={copyToClipboard} // Updated event handler
            >
                <label className="swap swap-rotate">
                    <input
                        type="checkbox"
                        className="hidden"
                        checked={copySuccess}
                        readOnly
                    />
                    <FontAwesomeIcon icon={faCopy} className="swap-off" />
                    <FontAwesomeIcon icon={faCheck} className="swap-on" />
                </label>
            </button>
        </div>
    )

}

export default CopyButton;
