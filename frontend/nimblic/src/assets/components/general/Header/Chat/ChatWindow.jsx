import React, { useState, useImperativeHandle, useEffect, useRef, forwardRef, useContext } from 'react';
import UserManager from '../../../../services/user/userManager';
import { FileUploadContext } from '../../Upload/FileUploadContext';
import { TabsContext } from '../../Tabs/TabsContext';
import { SettingsContext } from '../../../Settings/SettingsContext';
import useChatMessaging from './Window/useChatMessaging'
import MessageList from './Window/MessageList';
import FollowUpQuestionSection from './Window/FollowUpQuestionSection';
import InfoToolTip from './Window/InfoToolTip';
import TopicSelection from './Window/TopicSelection';
import InfoSection from './Window/InfoSection';
import ActionSection from './Window/ActionSection';

const ChatWindow = forwardRef(({ setSending, isSending, setShowTopicSelection, showTopicSelection }, ref) => {
    const [userAuth, setUserAuth] = useState(UserManager.getUserAuth());
    const [userData, setUserData] = useState(UserManager.getUserData());
    const [text, setText] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [isSendingQuestions, setSendingQuestions] = useState(false);
    const { uploadData, isUploading } = useContext(FileUploadContext);
    const { activeIndex } = useContext(TabsContext);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const { settings } = useContext(SettingsContext);
    const currentData = uploadData[activeIndex === -1 ? 0 : activeIndex]; // If in the uploads tab

    const topicDataMapping = {
        "General": currentData?.metadata,
        "Statistics": currentData?.statistical_summary,
        "Data Quality": currentData?.data_quality,
        "Change Point Detection": currentData?.change_points,
        "Correlation Network": currentData?.correlation_network,
        "Graph Recommendations": currentData?.graph_recommendations,
    };


    const isValidValue = value => {
        return value !== null && value !== "None" && !(Array.isArray(value) && value.length === 0);
    };

    const filteredTopics = Object.keys(topicDataMapping).filter(key => isValidValue(topicDataMapping[key]));

    // Use custom hook for chat messaging
    const { messages, followUpQuestions, sendChat, deleteMessages } = useChatMessaging(
        setSending,
        setLoading,
        userAuth,
        setSelectedTopic,
    );

    useEffect(() => {
        const handleUserDataChange = (newUserData) => {
            setUserData(newUserData);
        };

        const handleUserAuthChange = (newUserAuth) => {
            setUserAuth(newUserAuth);
        };

        UserManager.subscribeToUserDataUpdates(handleUserDataChange);
        UserManager.subscribeToUserAuth(handleUserAuthChange);

        return () => {
            UserManager.unsubscribeFromUserDataUpdates(handleUserDataChange);
            UserManager.unsubscribeFromUserAuth(handleUserAuthChange);
        };
    }, []);

    const sendUserChatMessage = async (text, topic) => {
        console.log("Sending user chat message")
        if (!text || !text.trim() || isSending) return;

        setText(text);

        if (!topic) {
            console.log("Showing topic selection")
            setShowTopicSelection(true); // Show topic selection
            return;
        }

        console.log("Setting selected topic: ", topic)
        setSelectedTopic(topic);
        setShowTopicSelection(false);

        sendChat(text, topic)
    }

    useImperativeHandle(ref, () => ({
        sendMessage: (text) => sendUserChatMessage(text, selectedTopic),
    }));


    if (isLoading) {
        return (
            <div className="my-6">
                <div className="flex flex-col items-center h-fit w-full gap-6 my-32">
                    <div className="loading loading-spinner text-primary text-lg"></div>
                </div>
                <div className="absolute bottom-3 left-3">
                    <InfoToolTip />
                </div>
            </div>
        )
    }

    if (messages.length == 0) {
        return (
            <div className="">
                <TopicSelection
                    filteredTopics={filteredTopics}
                    sendMessage={(text, topic) => sendUserChatMessage(text, topic)}
                    text={text}
                    showTopicSelection={showTopicSelection}
                />
                <FollowUpQuestionSection
                    followUpQuestions={followUpQuestions}
                    sendMessage={(text) => sendUserChatMessage(text, selectedTopic)}
                    showTopicSelection={showTopicSelection}
                />
                <div className="flex flex-col items-center h-fit w-full gap-6 py-24">
                    <img src="/svg/robot.svg" alt="Nimblic AI chatbot" width="100" />
                    <p className="text-2xl font-semibold text-base-content/80">Let AI answer complex questions about your data</p>
                </div>
                <div className="absolute bottom-0 w-full bg-base-100/50 backdrop-blur-lg rounded-b-lg">
                    <InfoSection
                        userData={userData}
                        settings={settings}
                        currentData={currentData}
                    />
                </div>
            </div>
        )
    }


    return (
        <>
            <TopicSelection
                filteredTopics={filteredTopics}
                sendMessage={(text, topic) => sendUserChatMessage(text, topic)}
                text={text}
                showTopicSelection={showTopicSelection}
            />
            <FollowUpQuestionSection
                followUpQuestions={followUpQuestions}
                sendMessage={(text) => sendUserChatMessage(text, selectedTopic)}
                showTopicSelection={showTopicSelection}
                isSendingQuestions={isSendingQuestions}
            />
            <MessageList messages={messages} isSending={isSending} />
            <div className={`${showTopicSelection ? 'rounded-b-lg bottom-0' : 'bottom-[72px]'} absolute bg-base-100/50 backdrop-blur-lg w-full`}>
                <InfoSection
                    userData={userData}
                    settings={settings}
                    currentData={currentData}
                />
            </div>
            <ActionSection
                filteredTopics={filteredTopics}
                selectedTopic={selectedTopic}
                setSelectedTopic={setSelectedTopic}
                showTopicSelection={showTopicSelection}
                deleteMessages={deleteMessages}
            />
        </>
    );
});

export default ChatWindow;
