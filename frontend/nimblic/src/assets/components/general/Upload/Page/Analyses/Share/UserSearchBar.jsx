import { Fragment } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { ChevronUpDownIcon, UsersIcon } from '@heroicons/react/20/solid'
import React from 'react';

const UserSearchBar = ({ handleShare, query, setQuery, isSearchingUsers, filteredUsers, usersWithAccess }) => {

    return (
        <Combobox onChange={(event) => handleShare(event)} className="w-full">
            <div className="relative mt-1">
                <div className="relative w-full h-fit p-1 bg-base-300 rounded-xl cursor-default overflow-hidden text-left shadow-sm sm:text-sm">
                    <UsersIcon
                        className="h-5 w-5 text-secondary absolute -translate-y-1/2 top-1/2 left-4"
                        aria-hidden="true"
                    />
                    <Combobox.Input
                        className="w-full pl-10 h-12 bg-base-300 border-none py-2 pr-10 text-[1.2em] leading-5 text-neutral-content outline outline-neutral outline-offset-1 rounded-lg outline-4 z-[10]"
                        displayValue={(person) => person.name}
                        placeholder={"Search..."}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                            className="h-5 w-5 text-neutral-content/80"
                            aria-hidden="true"
                        />
                    </Combobox.Button>
                </div>
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery('')}
                >
                    <Combobox.Options className="absolute z-[10] mt-1 max-h-60 w-full overflow-auto rounded-md bg-base-200 py-1 text-base shadow-lg ring-0 focus:outline-none sm:text-sm">
                        {isSearchingUsers ? (
                            <Combobox.Option value={'loading'} key={'loading'}>
                                <div className="relative select-none px-4 py-2 text-neutral-content/80 cursor-pointer flex items-center justify-center w-full">
                                    <span className="loading loading-spinner text-secondary" />
                                </div>
                            </Combobox.Option>
                        )
                            :
                            filteredUsers.length === 0 && query !== '' ? (
                                <Combobox.Option value={query} key={query}>
                                    <div className="relative select-none px-4 text-lg py-2 text-neutral-content/80 cursor-pointer">
                                        No users found.
                                    </div>
                                </Combobox.Option>
                            ) : (
                                filteredUsers && filteredUsers.map((user) => (
                                    <Combobox.Option
                                        key={user.id}
                                        disabled={usersWithAccess.some(u => u.id === user.id)}
                                        className={({ active }) =>
                                            `relative ${usersWithAccess.some(u => u.id === user.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} opacity-100 cursor-not-allowed select-none py-2 pl-10 pr-4 ${active ? 'bg-secondary/80 text-white/80' : 'text-neutral-content'
                                            }`
                                        }
                                        value={user}
                                    >
                                        <div className="flex flex-row gap-3 items-center text-[1.1em]">
                                            <label tabIndex="0" className={`avatar ${user.photoURL ? '' : 'placeholder bg-base-100 rounded-full font-sans font-medium'}`}>
                                                <div className="w-8 h-8 rounded-full">
                                                    {user.photoURL ?
                                                        <img src={user.photoURL} />
                                                        : <span className="text-md">{user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}</span>}
                                                </div>
                                            </label>
                                            {user.displayName || user.email}
                                        </div>
                                    </Combobox.Option>
                                ))
                            )}
                    </Combobox.Options>
                </Transition>
            </div>
        </Combobox>
    )
}

export default UserSearchBar
