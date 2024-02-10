import { XMarkIcon } from '@heroicons/react/20/solid'
import _ from 'lodash';
import React from 'react';

const UserAccessList = ({ usersWithAccess, userAuth, sharingStatus, isLoadingAccessUsers, handleUnshare }) => {
    return (
        <>
            <p className="font-semibold w-full text-start mb-2">People with access</p>
            {isLoadingAccessUsers ? (
                <span className="loading loading-spinner text-secondary" />
            )
                :
                (<div className="max-h-[240px] overflow-y-auto w-full">
                    {usersWithAccess && usersWithAccess.map((user) => (
                        <div key={user.id} className="w-full flex flex-row px-2 mb-6 items-center justify-between group">
                            <div className="flex flex-row gap-3 items-center">
                                <label tabIndex="0" className={`avatar ${user.photoURL ? '' : 'placeholder bg-base-100 rounded-full font-sans font-medium'}`}>
                                    <div className="w-8 h-8 rounded-full">
                                        {user.photoURL ?
                                            <img src={user.photoURL} />
                                            : <span className="text-md">{user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}</span>}
                                    </div>
                                </label>
                                {user.displayName || user.email}
                            </div>
                            {sharingStatus[user.id] ? <span className="loading loading-spinner text-secondary" />
                                : <div className="flex flex-row gap-2 items-center">
                                    <p className="text-neutral-content/80 font-semibold">{user.id === userAuth.uid ? 'Owner' : 'Viewer'}</p>
                                    {user.id !== userAuth.uid &&
                                        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity px-8 right-0">
                                            <button className="btn btn-circle btn-outline btn-error btn-xs"
                                                onClick={() => handleUnshare(user)}>
                                                <XMarkIcon
                                                    className="h-4 w-4 hover:text-base-100 group-active:text-base-100"
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        </div>}
                                </div>}
                        </div>
                    ))}
                </div>)}
        </>
    )
}

export default UserAccessList
