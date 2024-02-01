// chatbotService.js
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getTopicFromPath } from 'src/utils/chatUtil'
import { collection, query, onSnapshot, deleteDoc, getDocs, doc, orderBy } from 'firebase/firestore';
import { firestore } from '../../../firebase-config';
import { parseQuestion } from '/src/utils/chatUtil'

export const createMessageObject = (type, text, userAuth, topic, state = 'COMPLETED') => {

    let userAvatar;
    try {
        userAvatar = userAuth?.photoURL || userAuth?.displayName[0].toUpperCase()
    } catch (error) {
        userAvatar = userAuth?.email[0].toUpperCase()
    }

    let aiAvatar = '/svg/robot.svg'

    return {
        type,
        text,
        avatarType: type === 'user' ? 'user' : type === 'error' ? 'error' : 'ai',
        avatar: type === 'user' ? userAvatar : aiAvatar,
        name: type === 'user' ? 'You' : 'AI Chatbot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        topic,
        state
    };
};

const processMessage = (data, userAuth, updatedMessages) => {
    let message = null;
    let topic = null;
    let followUpQuestions = null;

    //console.log("PROCESSING MESSAGE: ", data)

    if (data.requestType !== 'mainResponse') return

    if (data.prompt && data.topic) {
        let userText = data.prompt;
        try {
            let parsedPrompt = JSON.parse(data.prompt)
            userText = parsedPrompt.userText;
            topic = getTopicFromPath(data.topic)
        } catch (error) {
            console.error("USER MESSAGE PARSE ERROR: ", error);
        }

       // console.log("USER MESSAGE PROCESSED")
        message = createMessageObject('user', userText, userAuth, topic); //No sending state, always PROCESSED
        updatedMessages.push(message);
    }

    if (data.status && data.status.state) {
        let text = data.response
        let type = 'ai'
        if (text) {
            try {
                let parsedResponse = JSON.parse(text)
                //console.log("PARSED RESPONSE", parsedResponse)
                followUpQuestions = parsedResponse.followUpQuestions
                text = parsedResponse.mainResponse
            } catch (error) {
                //console.error("FAILED TO PARSE CHATBOT RESPONSE: ", error);
            }
            message = createMessageObject(type, text, userAuth, topic, data.status.state);
        }
        else {
            if (data.status.state === "ERROR") {
                text = "Something went wrong. Please try again."
                type = 'error'
            }
            message = createMessageObject(type, text, userAuth, topic, data.status.state);
        }

       // console.log("CHATBOT MESSAGE PROCESSED")
        updatedMessages.push(message);
    } else {
       // console.log("MESSAGE DOES NOT EXIST YET")
        message = createMessageObject('ai', "Thinking...", userAuth, topic, 'PROCESSING'); //Does not exist in db yet
        updatedMessages.push(message);
    }

    return followUpQuestions
};

const parseFollowUpQuestions = (lastFollowUpQuestion) => {
    if (!lastFollowUpQuestion) return

    try {
        return parseQuestion(lastFollowUpQuestion);
    } catch (error) {
        console.error("Error parsing follow up question response");
        return lastFollowUpQuestion.split('\n').filter(q => q.trim()).map(q => q.trim());
    }
};

const processFollowUpQuestions = (data, setQuestionsSending) => {
    if (data.requestType !== 'followUpQuestions') return

    if (data.status) {
        if (data.status.state == 'PROCESSING') {
          //  console.log("QUESTIONS PROCESSING")
            setQuestionsSending(true)
        } else if (data.status.state == 'COMPLETED') {
          //  console.log("QUESTIONS COMPLETED")
            setQuestionsSending(false)
            return parseFollowUpQuestions(data.response);
        } else if (data.status.state == 'ERROR') {
          //  console.error("ERROR RECIEVING FOLLOW UP QUESTIONS")
            setQuestionsSending(false)
        }
    }
}

export const subscribeToMessages = (userAuth, discussionId, setMessages, setFollowUpQuestions, setLoading, setQuestionsSending) => {
    const messagesRef = collection(firestore, `users/${userAuth.uid}/discussions/${discussionId}/messages`);
    const q = query(messagesRef, orderBy("createTime", "asc")); // or "desc" for descending order

    return onSnapshot(q, (querySnapshot) => {
        const updatedMessages = [];
        let updatedFollowUpQuestions = [];

        querySnapshot.docs.forEach(doc => {

            const data = doc.data();
            let followUpQuestions = processMessage(data, userAuth, updatedMessages);

            if(followUpQuestions) {
          //      console.log("Follow up questions from main response")
                updatedFollowUpQuestions = followUpQuestions
            } else {
            //    console.log("NO Follow up questions from main response")
            }
        });

        console.log("UPDATED MESSAGES: ", updatedMessages)

        let lastElement = null;

        if (updatedFollowUpQuestions.length <= 0) {
            const lastDoc = [...querySnapshot.docs].reverse().find(doc => doc.data().requestType === 'followUpQuestions');
            lastElement = lastDoc ? lastDoc.data() : null;

          //  console.log("Last element data: ", lastElement);

            if (lastElement) {
                updatedFollowUpQuestions = processFollowUpQuestions(lastElement, setQuestionsSending)
            }
        }

        if (updatedMessages.length > 0) {
            setMessages(updatedMessages);
        }

        if (updatedFollowUpQuestions && updatedFollowUpQuestions.length > 0) {
         //   console.log("FOLLOW UP QUESTIONS: ", updatedFollowUpQuestions)
            setFollowUpQuestions(updatedFollowUpQuestions);
        }

        setLoading(false);
    });
};

export const deleteAllMessages = async (userAuth, discussionId, setMessages) => {
    const q = query(collection(firestore, `users/${userAuth.uid}/discussions/${discussionId}/messages`));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
    });

    setMessages([]);
};

export const sendMainResponseToFirebase = async (discussionId, prompt) => {
    const functions = getFunctions();
    const processMessage = httpsCallable(functions, 'processMessage');


   // console.error("SENDING MAIN RESPONSE")

    try {
        await processMessage({ prompt, discussionId });
    } catch (error) {
        // Handle error
    }
};

export const sendFollowUpQuestionsToFirebase = async (discussionId, prompt) => {
    const functions = getFunctions();
    const processMessage = httpsCallable(functions, 'processMessage');

  //  console.error("SENDING FOLLOW UP QUESTIONS")

    try {
        await processMessage({ prompt, discussionId });
    } catch (error) {
        //Handle error
    }
};
