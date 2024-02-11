import { useEffect, useState, useContext } from 'react';
import { getFirestore, collection, onSnapshot, query, getDocs, deleteDoc } from 'firebase/firestore';
import { generateFileId } from 'src/utils/fileUtil';
import { FileUploadContext } from '../../../Upload/FileUploadContext';
import { SettingsContext } from '../../../../Settings/SettingsContext';
import { TabsContext } from '../../../Tabs/TabsContext'
import { topicPathMapping, getTopicFromPath } from 'src/utils/chatUtil'
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';
import { getFirebaseErrorMessage } from 'src/utils/errorUtil';

const useChatMessaging = (
    setSending,
    setLoading,
    userAuth,
    setSelectedTopic,
) => {
    const [messages, setMessages] = useState([]);
    const { uploadData } = useContext(FileUploadContext);
    const { activeIndex } = useContext(TabsContext);
    const { settings } = useContext(SettingsContext);
    const currentData = uploadData[activeIndex === -1 ? 0 : activeIndex];
    const db = getFirestore()
    const functions = getFunctions();

    const [followUpQuestions, setFollowUpQuestions] = useState([
        "What do I need to fix before I start using my data?",
        "Are there any interesting aspects of my data?",
        "Explain the results of the analysis and what it could depend on"
    ]);

    //connectFunctionsEmulator(functions, "127.0.0.1", 5001);

    useEffect(() => {
        setLoading(true)
        setMessages([])
        if (!userAuth) {
            return;
        }
        const discussionId = generateFileId(currentData?.metadata)
        const unsubscribe = onSnapshot(collection(db, `users/${userAuth.uid}/discussions/${discussionId}/messages`), (snapshot) => {
            const loadedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Sort messages by timestamp
            const sortedMessages = loadedMessages.sort((a, b) => (a.timestamp?.seconds ?? 0) - (b.timestamp?.seconds ?? 0));

            // Process each message individually
            let processedMessages = []

            sortedMessages.forEach(message => {
                let messages = processMessage(message);
                processedMessages.push(...messages)
            });

            setMessages(processedMessages);

            const lastTopic = processedMessages[processedMessages.length - 1]?.topic

            if (lastTopic) {
                setSelectedTopic(getTopicFromPath(lastTopic))
            }

            const lastFollowUpQuestions = sortedMessages[sortedMessages.length - 1]?.followUpQuestions ?? []
            

            const newFollowUpQuestions = []
            lastFollowUpQuestions.forEach(prop => {
                newFollowUpQuestions.push(prop.question || prop)
            })

            if (newFollowUpQuestions.length > 0) {
                console.log("SETTING NEW FUQ: ", newFollowUpQuestions)
                setFollowUpQuestions(newFollowUpQuestions)
            }

            setLoading(false)

        });

        return () => unsubscribe();
    }, [userAuth]);


    const processMessage = (data) => {

        if (data.length <= 0) {
            return
        }

        const messages = [];

        if (data.prompt) {
            let userMessage = createMessageObject('user', data.prompt, data.topic, data.timestamp); //No sending state, always PROCESSED
            messages.push(userMessage)
        }

        if (data.status && data.status.state) {
            let errorText;
            if (data.response.length >= 0 && data.status.error) {
                errorText = getFirebaseErrorMessage(data.status.error)
                console.log("CHATBOT ERROR: ", errorText)
            }

            let responseArr = data.response
            let responseStr = responseArr && responseArr.join("")

            let metadata;
            if (responseStr) {
                metadata = {
                    glossary: data.glossary,
                    actionableSteps: data.actionableSteps,
                    resources: data.resources,
                };
            }


            let botMessage = createMessageObject('ai', responseStr || errorText, data.topic, data.timestamp, data.status.state, metadata);
            messages.push(botMessage)
        } else {
            console.log("MESSAGE DOES NOT EXIST YET")
        }

        if (messages.length <= 0) return

        return messages
    };

    const createMessageObject = (role, text, topic, time, state = 'DONE', metadata) => {

        let dateString;
        if (time) {
            const date = new Date(time.seconds * 1000 + (time.nanoseconds || 0) / 1000000);
            dateString = date.toLocaleTimeString("en-US", {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true // Ensures AM/PM format
            });
        } else {
            dateString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }

        let aiAvatar = '/svg/robot.svg'
        let userAvatar;
        try {
            userAvatar = userAuth?.photoURL || userAuth?.displayName[0].toUpperCase()
        } catch (error) {
            userAvatar = userAuth?.email[0].toUpperCase()
        }
        return {
            role,
            text,
            avatar: role === 'user' ? userAvatar : aiAvatar,
            name: role === 'user' ? 'You' : 'AI Chatbot',
            time: dateString,
            topic,
            state,
            metadata
        };
    };

    const addMessage = (role, text, topic, state) => {
        let newMessage = createMessageObject(role, text, topic, null, state);
        if (state == 'ERROR') {
            setMessages(prevMessages => {
                let updatedMessages = [...prevMessages];
                // Ensure there's at least one message to replace
                if (updatedMessages.length > 0) {
                    updatedMessages[updatedMessages.length - 1] = newMessage; // Replace the last message
                }
                return updatedMessages;
            });
            return;
        }
        setMessages(prevMessages => [...prevMessages, newMessage])
    };

    const sendChat = async (text, topic) => {

        // Prevent the message of appearing twice if the function is reiterated upon topic selection
        if (messages.length === 0 || messages[messages.length - 1]?.text !== text) {
            addMessage('user', text, topic, 'SENDING');
        }

        addMessage('ai', ' ', topic, 'SENDING');

        const sendChatFn = httpsCallable(functions, 'sendChat');

        const analysisId = generateFileId(currentData?.metadata)

        console.log("currentData", currentData)
        console.log("currentData?.metadata", currentData?.metadata)

        const prompt = {
            userText: text,
            skillLevel: settings.skillLevel,
            analysisId,
            topic: topicPathMapping[topic],
            ownerId: currentData?.metadata?.author?.uid || userAuth.uid
        };

        console.log("SENDING PROMPT: ", prompt)

        try {
            setSending(true)
            await sendChatFn(prompt);
            setSending(false)
        } catch (error) {
            setSending(false)
            // Adjust error handling based on the structure of errors returned by your backend
            const userFriendlyMessage = getFirebaseErrorMessage(error);
            addMessage('ai', userFriendlyMessage, topic, "ERROR");
        }
    };

    const deleteMessages = async () => {
        setLoading(true);
        const discussionId = generateFileId(currentData?.metadata);

        const q = query(collection(db, `users/${userAuth.uid}/discussions/${discussionId}/messages`));
        const querySnapshot = await getDocs(q);
        const deletionPromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));

        // Wait for all deletions to complete
        await Promise.all(deletionPromises);

        setSelectedTopic(null);
        setMessages([]);
        setLoading(false);
    };

    return { messages, followUpQuestions, sendChat, deleteMessages };
};

export default useChatMessaging;
