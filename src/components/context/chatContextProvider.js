/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useContext, useState, useEffect } from "react";
import Pubnub from "pubnub";
import { v4 as uuidv4 } from "uuid";

const PUBNUB_PUBLISH_KEY_COMMUNITY =
  "pub-c-360211b6-333e-4da2-89c0-47bd29950ec2";
const PUBNUB_SUBSCRIBE_KEY_COMMUNITY =
  "sub-c-8de12ef2-480c-11ec-9507-2ead4dd001bc";

const ChatContext = createContext();

export const ContextProvider = ({ children }) => {
  const [currentChannel, setCurrentChannel] = useState("");
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [hasMoreMsgs, setHasMoreMsgs] = useState(false);
  const [startTimeToken, setStartTimeToken] = useState('')

  // console.log('changessss')

  const userid = "ahmadpubnubtest";
  const messageCount = 10;
  // const defaultTimeToken = '16455645907354341';

  const pubnubConfig = {
    publishKey: PUBNUB_PUBLISH_KEY_COMMUNITY,
    subscribeKey: PUBNUB_SUBSCRIBE_KEY_COMMUNITY,
    uuid: userid,
    // logVerbosity: true,
  };

  const pubnub = new Pubnub(pubnubConfig);

  const messageEventHandler = (msg) => {
    const messageData = {
      senderId: msg.uuid,
      text: msg.message,
      time: parseInt(msg.timetoken, 10) / 10000000,
      id: msg.id,
    };
    
    setMessages((prevState) => [...prevState, messageData]);
  };

  // const pubnubListeners = {
  //   message: messageEventHandler,
  //   status: (status) => console.log("STATUS EVENT", status),
  // };
  // pubnub.addListener(pubnubListeners);

  useEffect(() => {
    // a minimum of 1 channel must be used to create a channel group
    const addChannel = async () => {
      await pubnub.channelGroups.addChannels({
        channels: [`${userid}-demo`],
        channelGroup: userid,
      });
    };
    addChannel();

    // pubnub.subscribe({
    //   channels: [`${userid}-demo`],
    // });

    const fetchUserChannels = async () => {
      const result = await pubnub.channelGroups.listChannels({
        channelGroup: userid,
      });
      setChannels(result.channels);
    };

    fetchUserChannels();
  }, []);

  const fetchMessages = async (channel, msgCount, startTToken='') => {
    setLoadingChats(true);

    let messagesRes;
    if (startTToken) {
      messagesRes = await pubnub.fetchMessages({
        channels: [channel],
        count: msgCount,
        start: startTToken,
      });
    } else {
      messagesRes = await pubnub.fetchMessages({
        channels: [channel],
        count: msgCount,
      });
    }

    messagesRes = messagesRes.channels[channel]
    if (messagesRes) {
      console.log('messagesRes', messagesRes, messagesRes.length)
      const parsedMessages = messagesRes.map((msg) => ({
        senderId: msg.uuid,
        text: msg.message,
        time: parseInt(msg.timetoken, 10) / 10000000,
        id: msg.id,
      }))
      setStartTimeToken(messagesRes[0].timetoken)
      setHasMoreMsgs(messagesRes.length === msgCount);
      setLoadingChats(false);
      return parsedMessages;
    }
  }

  useEffect(() => {
    if (!currentChannel) return;

    const pubnubListeners = {
      message: messageEventHandler,
      status: (status) => console.log("STATUS EVENT", status),
    };

    pubnub.unsubscribeAll();
    pubnub.removeListener(pubnubListeners);
    pubnub.addListener(pubnubListeners);

    setMessages([]);

    pubnub.subscribe({
      channels: [currentChannel],
    });

    const loadChannelDetails = async () => {
      const messagesRes = await fetchMessages(currentChannel, messageCount);
      setMessages(messagesRes);
    };

    loadChannelDetails();

    return () => pubnub.unsubscribeAll();
  }, [currentChannel]);

  const loadMoreMsgs = async () => {
    const messagesRes = await fetchMessages(currentChannel, messageCount, startTimeToken);
    setMessages(prevState => [...messagesRes, ...prevState])
  }

  const createChannel = async (name) => {
    const userGroup = userid;
    const channel = `${name.replace(/\s/g, "")}-${uuidv4()}`;

    await pubnub.channelGroups.addChannels({
      channels: [channel],
      channelGroup: userGroup,
    });

    setCurrentChannel(channel);
    setChannels((prevState) => [channel, ...prevState]);
  };

  const goToChannel = (channel) => {
    setCurrentChannel(channel);
  };

  const sendMessage = (newMsg) => {
    console.log(currentChannel, `${userid}-demo`);
    pubnub.publish({
      message: newMsg,
      channel: currentChannel,
      id: uuidv4(),
    });
  };

  const value = {
    messages,
    currentChannel,
    createChannel,
    goToChannel,
    loadingChats,
    channels,
    sendMessage,
    loadMoreMsgs,
    hasMoreMsgs,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const context = useContext(ChatContext);

  if (context === undefined) {
    console.log("useChat must be used within a ChatContextProvider");
    return {};
  }

  return context;
};
