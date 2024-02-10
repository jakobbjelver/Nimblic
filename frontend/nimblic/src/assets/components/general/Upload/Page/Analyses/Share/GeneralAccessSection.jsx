import _ from 'lodash';
import Dropdown from '../../../../Dropdown';
import React, { useState } from 'react';
import { ShareIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

const GeneralAccessSection = ({ }) => {

    const items = ["Anyone", "Limited"]
    const [selectedAccessLevel, setSelectedAccessLevel] = useState(items[1]);

    return (
        <>
            <div className="flex flex-grow" />
            <p className="font-semibold w-full text-start">General access</p>
            <div className="flex flex-row items-center justify-between -mt-3 w-full">
                <span className="flex flex-row gap-3 items-center">
                    {selectedAccessLevel == items[0] ? (
                        <>
                            <GlobeAltIcon className="h-5 w-5 text-success" />
                            <p className="">Anyone with the link can view</p>
                        </>
                    ) :
                        (<>
                            <ShareIcon className="h-5 w-5 text-secondary" />
                            <p>Only people with access can view</p>
                        </>
                        )}
                </span>
                <Dropdown items={items} selectedItem={selectedAccessLevel} onChange={setSelectedAccessLevel} position="top" />
            </div>
        </>
    )
}

export default GeneralAccessSection
