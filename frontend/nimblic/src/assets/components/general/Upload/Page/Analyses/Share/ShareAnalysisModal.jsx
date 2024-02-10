import userManager from '../../../../../../services/user/userManager'
import _ from 'lodash';
import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import AnalysisManager from '../../../../../../services/analyses/analysisManager';
import { AlertContext } from '../../../../Alert/AlertContext';
import { getCurrentTime } from 'src/utils/textFormat'
import { getFirebaseErrorMessage } from 'src/utils/errorUtil'
import UserSearchBar from './UserSearchBar';
import UserAccessList from './UserAccessList';
import GeneralAccessSection from './GeneralAccessSection';

const ShareAnalysisModal = ({ analysis, userAuth, recommendedIds }) => {
    const analysisManager = useRef(null);
    const [recommendedUsers, setRecommendedUsers] = useState([]);
    const [searchedUsers, setSearchedUsers] = useState([]);
    const [usersWithAccess, setUsersWithAccess] = useState([]);
    const [isSearchingUsers, setSearchingUsers] = useState(false);
    const [isLoadingAccessUsers, setLoadingAccessUsers] = useState(false);
    const [sharingStatus, setSharingStatus] = useState({});
    const { setErrorMessage, setInfoMessage } = useContext(AlertContext);
    const [query, setQuery] = useState('')

    const currentUsers = recommendedUsers.length !== 0 ? recommendedUsers : searchedUsers

    const filteredUsers =
        query === ''
            ? currentUsers
            : currentUsers.filter((user) =>
                (user.displayName || user.email)
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .includes(query.toLowerCase().replace(/\s+/g, ''))
            )

    useEffect(() => {

        analysisManager.current = new AnalysisManager(userAuth.uid);

        const loadUsers = async () => {
            setSearchingUsers(true)
            setLoadingAccessUsers(true)

            try {
                const users = await userManager.searchUsers(recommendedIds, 'id')

                const sharedWithIds = new Set(analysis.sharedWith);
                const accessUsers = users.filter(user => sharedWithIds.has(user.id));
                const accessUserIds = new Set(accessUsers.map(user => user.id));
                const remainingUsers = users.filter(user => !accessUserIds.has(user.id));
                accessUsers.unshift({
                    id: userAuth.uid,
                    displayName: userAuth.displayName,
                    email: userAuth.email,
                    photoURL: userAuth.photoURL
                })

                // Prevent modification mid-game
                if (usersWithAccess.length === 0) {
                    setUsersWithAccess(accessUsers)
                }
                setRecommendedUsers(remainingUsers)
                setSearchingUsers(false)
                setLoadingAccessUsers(false)
            } catch (error) {
                console.error(error)
                setErrorMessage({
                    type: "error",
                    short: `Failed to load recommended users`,
                    long: getFirebaseErrorMessage(error),
                    details: error,
                    time: getCurrentTime()
                });
                setSearchingUsers(false)
                setLoadingAccessUsers(false)
            }
        }

        loadUsers()
    }, []);

    // Define a stable callback for search
    const searchUsersCallback = useCallback((query) => {
        debounceSearchUsers(query, setSearchedUsers, setSearchingUsers, userManager);
    }, []); // Dependencies array is empty to create a stable reference

    useEffect(() => {
        if (query !== '' && !isSearchingUsers && filteredUsers.length === 0) {
            searchUsersCallback(query);
        }
    }, [query, searchUsersCallback]);

    const handleShare = async (user) => {
        if (!user || !user.id) return

        setSharingStatus(prevStatus => ({ ...prevStatus, [user.id]: true }));
        try {
            setUsersWithAccess(prevUsers => [...prevUsers, user])
            await analysisManager.current.shareAnalysis(analysis.id, user.id);
        } catch (error) {
            console.error(error)
            setUsersWithAccess(prevUsers => [...prevUsers.filter((u) => u.id !== user.id)])
            setErrorMessage({
                type: "error",
                short: `Failed to share analysis`,
                long: getFirebaseErrorMessage(error),
                details: error,
                time: getCurrentTime()
            });
        } finally {
            setSharingStatus(prevStatus => ({ ...prevStatus, [user.id]: false }));
        }
    };

    const handleUnshare = async (user) => {
        if (!user || !user.id) return

        setSharingStatus(prevStatus => ({ ...prevStatus, [user.id]: true }));
        try {
            await analysisManager.current.unshareAnalysis(analysis.id, user.id);
            setUsersWithAccess(prevUsers => [...prevUsers.filter((u) => u.id !== user.id)])
        } catch (error) {
            console.error(error)
            setErrorMessage({
                type: "error",
                short: `Failed to unshare analysis`,
                long: getFirebaseErrorMessage(error),
                details: error,
                time: getCurrentTime()
            });
        } finally {
            setSharingStatus(prevStatus => ({ ...prevStatus, [user.id]: false }));
        }
    }

    //Better user search in backend

    //General access
    //Copy link address
    //Switch from "Limited" to "Everyone with the link" (see English Google Drive language)
    //Create logic that makes it possible

    return (
        <div className="w-full flex flex-col items-start px-12 h-[550px]">
            <h3 className="font-semibold text-2xl mr-12">Share analysis '{analysis.name}'</h3>
            <div className="my-6 w-full flex flex-col items-center gap-4 h-full">
                <UserSearchBar 
                    handleShare={handleShare}
                    query={query}
                    setQuery={setQuery}
                    isSearchingUsers={isSearchingUsers}
                    filteredUsers={filteredUsers} 
                    usersWithAccess={usersWithAccess}/>                              
                <UserAccessList 
                    usersWithAccess={usersWithAccess}
                    userAuth={userAuth} sharingStatus={sharingStatus}
                    isLoadingAccessUsers={isLoadingAccessUsers}
                    handleUnshare={handleUnshare} />
                <GeneralAccessSection />
            </div>
        </div>
    )
}

export default ShareAnalysisModal

const debounceSearchUsers = _.debounce(async (query, setSearchResults, setIsSearching, userManager) => {
    if (!query) return; // Skip empty query
    setIsSearching(true);
    try {
        let users = await userManager.searchUsers([query], 'query');
        // Filter out the current user from the search results
        users = users.filter((u) => u.id !== userManager.userAuth.uid);
        setSearchResults(users);
    } catch (error) {
        // Handle error
    } finally {
        setIsSearching(false);
    }
}, 750);
