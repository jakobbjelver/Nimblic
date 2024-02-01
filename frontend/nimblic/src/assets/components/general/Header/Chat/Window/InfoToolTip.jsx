import React from 'react';
import { InformationCircleIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const InfoToolTip = () => {
    return (
        <div className="dropdown dropdown-top">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm">
                <InformationCircleIcon className="h-6 w-6 text-neutral-content/75" aria-hidden="true" />
            </div>
            <div tabIndex={0} className="z-[1] card card-compact dropdown-content w-52 bg-base-100 shadow mb-1">
                <div className="card-body">
                    <span className="text-xs">The AI chatbot may generate inaccurate and biased content. Do not enter sensitive information.</span>
                    <div className="card-actions">
                        <Link className="btn btn-block btn-sm" to={"/terms-of-service"}>
                            Terms of Service
                            <ArrowTopRightOnSquareIcon className="h-4 w-4 text-neutral-content/75" aria-hidden="true" />
                        </Link>
                        <Link className="btn btn-block btn-sm" to={"/data-protection-policy"}>
                            Data Privacy
                            <ArrowTopRightOnSquareIcon className="h-4 w-4 text-neutral-content/75" aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoToolTip;
