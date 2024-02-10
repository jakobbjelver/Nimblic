import React, { useState, useEffect } from 'react';


const AccountType = ( { userData } ) => {

    return (
            <div className="flex flex-col md:items-end items-center justify-center w-full">
                <div className="flex flex-row gap-4 items-center">
                    <div className={`badge badge-lg h-8 px-3 mt-1 ${userData.accountType == 'Admin' ? 'bg-gradient-to-r from-primary to-secondary text-neutral' : userData.accountType == 'Premium' ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral' : 'bg-gradient-to-r from-slate-400 to-slate-500 text-neutral'}`}>
                        <p className="text-xl">{userData.accountType}</p>
                    </div>
                    <div className="flex flex-row gap-2">
                        <div className="flex flex-col items-start justify-center">
                            <p className="font-extrabold text-xs mt-1 whitespace-nowrap">UPLOAD LIMIT</p>
                            <p className="font-extrabold text-xs mt-1 whitespace-nowrap">FILE SIZE LIMIT</p>
                            {userData.chatCredit && <p className="font-extrabold text-xs mt-1 whitespace-nowrap">CHAT CREDITS</p>}
                        </div>
                        <div className="flex flex-col items-start justify-center">
                            <p className="text-md whitespace-nowrap">{userData.uploadLimit} times/day</p>
                            <p className="text-md whitespace-nowrap">{userData.fileSizeLimit} MB</p>
                            <p className="text-md whitespace-nowrap">{userData.chatCredit}</p>
                        </div>

                    </div>
                </div>
            </div>
    );
};

export default AccountType;
