import React, { useState, useEffect, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { useChatContext } from './context/chatContextProvider';
import './ChatWindow.css';
// import { useEffect } from 'react/cjs/react.development';

const ChatWindow = () => {
  const [msgQuery, setMsgQuery] = useState('');
  const [newChannel, setNewChannel] = useState('');
  const [scrolledFirstTime, setScrolledFirstTime] = useState(false);
  const msgContainerRef = useRef(null);

  const { messages, currentChannel, channels, createChannel, sendMessage, goToChannel, loadingChats, loadMoreMsgs, hasMoreMsgs } = useChatContext();

  const createNewChannel = () => {
    if (newChannel) {
      createChannel(newChannel);
      setNewChannel('');
    }
  }

  const sendMessageHandler =  async () => {
    sendMessage(msgQuery)
    setMsgQuery('');
  }

  const onTextChange = (e) => {
    if (e.code === 'Enter') {
      sendMessageHandler();
      return;
    }
    setMsgQuery(e.target.value)
  }

  useEffect(() => {
    console.log(messages)

    if (!scrolledFirstTime && messages.length) {
      msgContainerRef.current.scrollTop = msgContainerRef.current.scrollHeight - msgContainerRef.current.clientHeight;
      setScrolledFirstTime(true)
    }
  }, [messages, scrolledFirstTime])

  useEffect(() => {
    console.log(hasMoreMsgs, loadingChats, hasMoreMsgs && !loadingChats);
  }, [hasMoreMsgs, loadingChats])

  return (
    <div className='container'>
      <div className='channels'>
        <h1>Channels</h1>
        <div>
          <textarea placeholder='New Channel' value={newChannel} onChange={(e) => setNewChannel(e.target.value)} />
          <button onClick={createNewChannel}>Create channel</button>
        </div>
        {channels.map((channel) => <button key={channel} className='channel' onClick={() => goToChannel(channel)}>{channel}</button>)}
      </div>
      <div className='msgs'>
        <h1>Channel: {currentChannel}</h1>
        <div className='msgs-container' ref={msgContainerRef}>
          {!messages?.length && !loadingChats && <p>No messages</p>}
          {loadingChats && <p>Loading</p>}
          {messages.length ? (
            <InfiniteScroll
              pageStart={0}
              initialLoad={false}
              loadMore={loadMoreMsgs}
              hasMore={scrolledFirstTime && hasMoreMsgs && !loadingChats}
              isReverse
              threshold={100}
              useWindow={false}
            >
              {messages.map((msg) => (
                <div className='message' key={msg.id || msg.time}>
                  <p>{msg.text}</p>
                  <p>{msg.time}</p>
                </div>
              ))}
            </InfiniteScroll>
          ) : null}
        </div>
        <div className='new-message'>
          <textarea value={msgQuery} onKeyDown={onTextChange} onChange={(e) => setMsgQuery(e.target.value)} />
          <button onClick={sendMessageHandler}>Send Message</button>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow;
