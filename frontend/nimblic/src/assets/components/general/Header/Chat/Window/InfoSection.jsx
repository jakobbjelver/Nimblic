import React from 'react';
import InfoToolTip from './InfoToolTip';
const InfoSection = ({ userData, settings, currentData }) => {
    return (
        <div className="flex flex-row items-center justify-center px-6 gap-5 z-[99]">
            <div className="absolute left-3">
                <InfoToolTip />
            </div>
            <div className="w-fit my-3 flex flex-row items-center justify-center gap-1.5">
                <p className="font-bold text-xs tracking-wide whitespace-nowrap">SKILL LEVEL</p>
                <div className="badge badge-primary badge-outline">{settings?.skillLevel[0].toUpperCase() + settings?.skillLevel.substring(1)}</div>
            </div>
            <div className="w-fit my-3 flex flex-row items-center justify-center gap-1.5">
                <p className="font-bold text-xs tracking-wide">CREDITS</p>
                <div className="badge badge-info badge-outline">{userData ? userData?.chatCredit : 0}</div>
            </div>
            <div className="w-fit my-3 flex flex-row items-center justify-center gap-1.5">
                <p className="font-bold text-xs tracking-wide">FILE</p>
                <div className="badge badge-secondary badge-outline">{currentData?.metadata.name}</div>
            </div>
        </div>
    );
};

export default InfoSection;
