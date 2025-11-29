import React from 'react'
import { useAuthContext } from '../../context/AuthContext';
import timeAgo from '../../utils/extractTime';
import useConversation from '../../zustand/useConversation';
import MessageStatus from './MessageStatus';

const Message = ({ message }) => {
  const { authUser } = useAuthContext();
  const { selectedConversation } = useConversation();
  const fromMe = message.senderId === authUser._id;
  const chatClass = fromMe ? "chat-end" : "chat-start";
  const profilePic = fromMe ? authUser.profilePic : selectedConversation.profilePic;
  const bubbleColor = fromMe ? "bg-blue-500" : "";

  const shakeClass = message.shouldShake ? "shake" : "";

  const time = timeAgo(message.createdAt);

  return (
    <div className={`chat ${chatClass}`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img alt={`${fromMe ? 'My profile' : 'Profile of '} ${selectedConversation.fullName}`} src={profilePic} />
        </div>
      </div>
      <div className={`chat-bubble pb-2 ${bubbleColor} ${shakeClass} flex flex-col`}>
        <span>{message.message}</span>
      </div>
      <div className="chat-footer opacity-50 flex items-center gap-1 text-xs mt-1">
        <span>{time}</span>
        {fromMe && <MessageStatus status={message.deliveryStatus} />}
      </div>
    </div>
  )
}

export default Message