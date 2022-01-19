import React, { useState } from 'react';
import { useChatContext } from './context/chatContextProvider';
import './ChatWindow.css';
// import { useEffect } from 'react/cjs/react.development';

const ChatWindow = () => {
  const [msgQuery, setMsgQuery] = useState('');
  const [newChannel, setNewChannel] = useState('');

  const { messages, currentChannel, channels, createChannel, sendMessage, goToChannel, loadingChats } = useChatContext();

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

  // useEffect(() => {
  //   console.log(messages)
  // }, [messages])

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
        <div className='msgs-container'>
          {!messages.length && !loadingChats && <p>No messages</p>}
          {loadingChats && <p>Loading</p>}
          {messages.map((msg) => (
             <div className='message' key={msg.id || msg.time}>
              <p>{msg.text}</p>
              <p>{msg.time}</p>
            </div>
          ))}
        </div>
        <div className='new-message'>
          <textarea value={msgQuery} onChange={(e) => setMsgQuery(e.target.value)} />
          <button onClick={sendMessageHandler}>Send Message</button>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow;
