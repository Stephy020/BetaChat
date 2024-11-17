import React, { useMemo } from 'react'
import useGetConversation from '../../hooks/useGetConversation.js'
import getRandomEmoji from '../../utils/emoji.js';
import Conversation from './Conversation'

const Conversations = () => {
  const {loading , conversations } = useGetConversation();
  console.log("CONVERSATIONS",conversations);

  // Memoize the assignment of emojis to ensure consistency across re-renders
 // Assuming each conversation has a 'lastMessage' with a 'timestamp'
 const sortedConversations = useMemo(() => {
  return conversations
    .map(conversation => ({
      ...conversation,
      emoji: getRandomEmoji(),  // Assign emoji here to keep it stable across renders
    }))
    .sort((a, b) => b.conversation- a.conversation); // Sort by descending timestamp    
}, [conversations]);

console.log("con",sortedConversations);


  return (
    <div  className='conversations py-2 flex flex-col overflow-auto'>
      {sortedConversations.map((conversation, idx) => (
        <Conversation
          key={conversation._id}
          conversation={conversation}
          emoji={conversation.emoji}
          lastIdx={idx === sortedConversations.length - 1}
        />
      ))}
         {loading?<span className='loading loading-spinner  '></span>:null}
    </div>
  )
}

export default Conversations;