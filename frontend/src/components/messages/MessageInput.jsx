import { BsSend } from "react-icons/bs"
import React from 'react'
import useSendMessage from "../../hooks/useSendMessage";
import { useState } from "react";

import useTypingIndicator from "../../hooks/useTypingIndicator";
import useConversation from "../../zustand/useConversation";

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const { loading, sendMessage } = useSendMessage();
  const { selectedConversation } = useConversation();
  const { handleTyping } = useTypingIndicator(selectedConversation?._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message) return;
    await sendMessage(message);
    setMessage("");
  }

  const handleChange = (e) => {
    setMessage(e.target.value);
    handleTyping();
  };

  return (
    <form onSubmit={handleSubmit} className='px-4 my-3'>
      <div className='w-full relative'>
        <input type="text" className='border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 text-white mt-auto' placeholder='Send a message'
          value={message}
          onChange={handleChange}
        />
        <button type='submit' className='absolute inset-y-0 end-0 flex items-center pe-3'>
          {loading ? <span className="loading loading-spinner"></span> : <BsSend />}
        </button>
      </div>

    </form>
  )
}

export default MessageInput
