import Dropdown from '../../../../Dropdown';
import React, { useState, useContext, useRef } from 'react';
import { getCurrentTime } from 'src/utils/textFormat'
import { getFirebaseErrorMessage } from 'src/utils/errorUtil'
import { ShareIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { AlertContext } from '../../../../Alert/AlertContext';
import userManager from '../../../../../../services/user/userManager'
import AnalysisManager from '../../../../../../services/analyses/analysisManager';

const GeneralAccessSection = ({ analysis }) => {
    const analysisManager = useRef(null);
    const items = ["Public", "Limited"]
    const [selectedAccessLevel, setSelectedAccessLevel] = useState(analysis.status.isPublic ? items[0] : items[1]);
    const [isLoading, setLoading] = useState(false);
    const { setErrorMessage, setInfoMessage } = useContext(AlertContext);

    const changeAccessLevel = async (level) => {

        userManager.waitForUserLoad()

        const user = userManager.getUserAuth()

        analysisManager.current = new AnalysisManager(user.uid);

        setLoading(true)
        try {
            await analysisManager.current.updateAccessLevel(analysis.id, selectedAccessLevel !== items[0])
            setLoading(false)
            setSelectedAccessLevel(level)
            setInfoMessage({
                type: "info",
                short: `Changed access level for '${analysis.name}' to ${level}`,
                time: getCurrentTime()
            });
        } catch (error) {
            setLoading(false)
            setErrorMessage({
                type: "error",
                short: `Failed to change access level to ${level}`,
                long: getFirebaseErrorMessage(error),
                details: error,
                time: getCurrentTime()
            });
        }
    }

    return (
        <>
            <div className="flex flex-grow" />
            <p className="font-semibold w-full text-start">General access</p>
            <div className="flex flex-row items-center justify-between -mt-3 w-full">
                <span className="flex flex-row gap-3 items-center">
                    {isLoading ? <div className="loading loading-spinner h-6 w-6"/>
                    : selectedAccessLevel == items[0] ? (
                        <>
                            <GlobeAltIcon className="h-6 w-6 text-primary" />
                            <p className="">Anyone with the link can view</p>
                        </>
                    ) :
                        (<>
                            <ShareIcon className="h-6 w-6 text-secondary" />
                            <p>Only people with access can view</p>
                        </>
                        )}
                </span>
                <Dropdown items={items} selectedItem={selectedAccessLevel} onChange={changeAccessLevel} position="top" />
            </div>
        </>
    )
}

export default GeneralAccessSection
