// useChatMessaging.js
import { topicPathMapping } from 'src/utils/chatUtil'
import { generateFileId } from 'src/utils/fileUtil';
import { useState, useEffect } from 'react';
import {
    subscribeToMessages,
    deleteAllMessages,
    sendMainResponseToFirebase,
    sendFollowUpQuestionsToFirebase,
    createMessageObject
} from '../../../../../services/chatbot/chatbotService';

const useChatMessaging = (
    setSending,
    setQuestionsSending,
    setLoading,
    userAuth,
    setFollowUpQuestions,
    topicDataMapping,
    setSelectedTopic,
    setShowTopicSelection,
    isSending,
    setText,
    metadata,
    settings,
    selectedTopic
) => {

    const [messages, setMessages] = useState([]);
    const [username, setUserName] = useState(null);

    const defaultQuestions = [
        "What do I need to fix?",
        "Best components for a PCA?",
        "Explain the results of the CPA"
    ]

    useEffect(() => {
        if (!userAuth) {
            return;
        }

        setLoading(true);

        const discussionId = generateFileId(metadata);
        const unsubscribe = subscribeToMessages(
            userAuth,
            discussionId,
            setMessages,
            setFollowUpQuestions,
            setLoading,
            setQuestionsSending
        );

        return () => {
            unsubscribe();
        };
    }, [userAuth]);

    useEffect(() => {
        if (messages.length > 0) {
            let lastMessage = messages[messages.length - 1]

          //  console.log("MESSAGES: ", messages)
          //  console.log("TOPIC: ", lastMessage.topic)
          //  console.log("STATE: ", lastMessage.state)

            if (lastMessage.topic) {
                setSelectedTopic(lastMessage.topic)
            }

            setSending(lastMessage.state == "PROCESSING")

        } else {
        //    console.log("NO MESSAGES")
            setFollowUpQuestions(defaultQuestions)
            setSending(false)
        }
    }, [messages]);

    useEffect(() => {
        if(!isSending) {
            const send = async () => {
                await sendFollowUpQuestions(selectedTopic);
            }
            send();
        }
    }, [isSending]);

    const deleteMessages = async () => {
        setLoading(true)
        const discussionId = generateFileId(metadata);
        await deleteAllMessages(userAuth, discussionId, setMessages);
        setSelectedTopic(null)
        setMessages([])
        setLoading(false)
    };

    const addMessage = (type, text, topic, state = "COMPLETED") => {
        const newMessage = createMessageObject(type, text, userAuth, topic, state);
        setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    const sendMainResponse = async (text, topic) => {

        console.log("SENDING MAIN WITH TOPIC: ", topic)
        console.log("SENDING MAIN WITH PATH: ", topicPathMapping[topic])
        const analysisId = generateFileId(metadata);
        const mainPrompt = {
            userText: text,
            skillLevel: settings.skillLevel,
            analysisId,
            requestType: 'mainResponse',
            topic: topicPathMapping[topic]
        };

        await sendMainResponseToFirebase(analysisId, mainPrompt);
    };

    const sendFollowUpQuestions = async (topic) => {

        console.log("SENDING FUQ WITH TOPIC: ", topic)
        console.log("SENDING FUQ WITH PATH: ", topicPathMapping[topic])
        const analysisId = generateFileId(metadata);
        let userPromptString = "Please provide three follow-up questions, based on the previous request, directly and solely in JSON. The question's should be short, under 15 words, and should be from the user's perspective. Remember that the questions need to be based on your previous answer as valid follow-up questions that the user can ask."
        const followUpPrompt = {
            userText: userPromptString,
            skillLevel: settings.skillLevel,
            analysisId,
            requestType: 'followUpQuestions',
            topic: topicPathMapping[topic]
        };

        // await sendFollowUpQuestionsToFirebase(analysisId, followUpPrompt);
    };

    const sendMessage = async (text, topic) => {
        if (!text || !text.trim() || isSending) return;

        setText(text);

        // Prevent the message of appearing twice if the function is reiterated upon topic selection
        if (messages.length === 0 || messages[messages.length - 1]?.text !== text) {
            addMessage('user', text, topic);
        }

        if (!topic) {
            setShowTopicSelection(true); // Show topic selection
            return;
        }

        addMessage('ai', "Thinking...", topic, "PROCESSING");

        setSelectedTopic(topic);
        setShowTopicSelection(false);

        await sendMainResponse(text, topic);
    };


    return { messages, sendMessage, deleteMessages };
};

export default useChatMessaging;
