import React, { useRef, useEffect } from 'react'
import useGetMessages from '../../hooks/useGetMessages'
import useListenMessages from '../../hooks/useListenMessages'
import usePolling from '../../hooks/usePolling'
import MessageSkeleton from '../skeletons/MessageSkeleton'
import Message from './Message'

const Messages = () => {
  const { messages, loading } = useGetMessages();
  useListenMessages();
  usePolling(); // Fallback for when socket is disconnected

  const lastMessageRef = useRef();

  useEffect(() => {
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100)
  }, [messages])

  return (
    <div className='messages flex-1 px-4 h-30 overflow-auto '>
      {!loading && messages.length > 0 && messages.map((message) => (
        <div key={message._id} ref={lastMessageRef}>
          <Message message={message} />
        </div>
      ))}

      {loading && [...Array(3)].map((_, idx) => <MessageSkeleton key={idx} />)}
      {!loading && messages.length === 0 && (
        <p className='text-center '>Send a message to start conversation</p>
      )}
    </div>
  )
}

export default Messages