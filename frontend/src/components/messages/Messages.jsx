import React, { useRef } from 'react'
import { useEffect } from 'react'
import useGetMessages from '../../hooks/useGetMessages'
import useListenMessages from '../../hooks/useListenMessages'
import MessageSkeleton from '../skeletons/MessageSkeleton'
import Message from './Message'

const Messages = () => {
  const {messages,loading} = useGetMessages();
  useListenMessages();
  const lastMessageRef = useRef();
  useEffect(() => {
    setTimeout(() =>{
      lastMessageRef.current?.scrollIntoView({behavior:"smooth"});
    },100)
    console.log("this hhhhh",lastMessageRef)
  
  }, [messages])
  
  
  return (
    
    <div className='messages flex-1 px-4 h-30 overflow-auto '>
        {!loading && messages.length > 0 && messages.map((message) => (
          <div key={message._id}
            ref={lastMessageRef}
          >
            <Message message={message} />
          </div>
        )
      
        )}

        {loading && [...Array(3)].map((_,idx) => <MessageSkeleton key={idx}/> )}
        {!loading && messages.length === 0 && (
          <p className='text-center '>Send a message to start conversation</p>
        )}
        
        
    </div>
  )
}

export default Messages