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

  const userid = "ahmadpubnubtest";

  const pubnubConfig = {
    publishKey: PUBNUB_PUBLISH_KEY_COMMUNITY,
    subscribeKey: PUBNUB_SUBSCRIBE_KEY_COMMUNITY,
    uuid: userid,
  };

  const pubnub = new Pubnub(pubnubConfig);

  const messageEventHandler = (msg) => {
    if (msg.message.text) {
      const messageData = {
        senderId: msg.message.uuid,
        text: msg.message.text,
        time: parseInt(msg.timetoken, 10) / 10000000,
      };

      if (messageData.senderId !== userid) {
        // dispatch(changeAutoScroll(false));
        setMessages((prevState) => [...prevState, messageData]);
      }
    }
  };

  useEffect(async () => {
    // a minimum of 1 channel must be used to create a channel group
    await pubnub.channelGroups.addChannels({
      channels: [`${userid}-demo`],
      channelGroup: userid,
    });

    
    const pubnubListeners = {
      message: messageEventHandler,
      status: (status) => console.log("STATUS EVENT", status),
    };
    pubnub.addListener(pubnubListeners);
    
    // pubnub.subscribe({
    //   channels: [`${userid}-demo`],
    // });

    const result = await pubnub.channelGroups.listChannels({
      channelGroup: userid,
    });
    console.log(result);
    setChannels(result.channels);

    return pubnub.unsubscribeAll();
  }, []);

  useEffect(async () => {
    if (!currentChannel) return;

    setMessages([])
    setLoadingChats(true);
    
    pubnub.subscribe({
      channels: [currentChannel],
    });

    const messagesRes = await pubnub.fetchMessages({
      channels: [currentChannel],
    });

    if (messagesRes.channels[currentChannel]) {
      messagesRes.channels[currentChannel].forEach((msg) => {
        const messageData = {
          senderId: msg.uuid,
          text: msg.message,
          time: parseInt(msg.timetoken, 10) / 10000000,
          id: msg.id,
        };
        setMessages((prevState) => [...prevState, messageData]);
      });
    }

    setLoadingChats(false);
  }, [currentChannel]);

  const createChannel = async (name) => {
    const userGroup = userid;
    const channel = `${name.replace(/\s/g, "")}-${uuidv4()}`;
    console.log(channel)

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
    console.log(currentChannel, `${userid}-demo`)
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
