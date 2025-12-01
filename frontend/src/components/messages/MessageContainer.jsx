import React from 'react'
import MessageInput from './MessageInput'
import { TiMessages } from "react-icons/ti"
import { TbArrowBackUp } from "react-icons/tb";
import GeminiChatInterface from '../gemini/GeminiChatInterface';

import Messages from './Messages'
import useConversation from '../../zustand/useConversation'
import { useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';

const MessageContainer = () => {
    const { authUser } = useAuthContext();
    const { selectedConversation, setSelectedConversation } = useConversation();
    const fullName = authUser.fullName;

    useEffect(() => {
        return () => setSelectedConversation(null);
    }, [setSelectedConversation]);

    return (
        !selectedConversation ?
            <div className={`md:min-w-[450px] flex flex-col overflow-auto w-full hidden md:flex message__container`}>
                <NoChatSelected fullName={fullName} />
            </div> :
            <div className={`md:min-w-[450px] flex flex-col overflow-auto w-full flex`}>
                <>
                    {selectedConversation.isGemini ? (
                        <GeminiChatInterface />
                    ) : (
                        <>
                            <div className='bg-slate-500 px-4 py-2 mb-2'>
                                <div className='flex justify-between items-center'>
                                    <div className=''>
                                        <span className='label-text'>To:</span>
                                        <span className='text-gray-900 font-bold '> {selectedConversation.fullName}</span>
                                    </div>

                                    <div className='flex items-center gap-2' >
                                        <TbArrowBackUp className='text-2xl hover:cursor-pointer md:hidden text-white'
                                            onClick={() => setSelectedConversation(null)}
                                        />
                                        <div className='w-10 rounded-full '>
                                            <img src={selectedConversation.profilePic} alt="User avatar" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Messages />
                            <MessageInput />
                        </>
                    )}
                </>
            </div>
    )
}

export default MessageContainer


const NoChatSelected = ({ fullName }) => {
    return (
        <div className="flex items-center justify-center w-full h-full">
            <div className='px-4 text-center sm:text-lg md:text-xl text-gray-200 font-semibold flex flex-col items-center gap-2'>
                <p>{`Welcome 👋 ${fullName}🤌`}</p>
                <p>Select a chat to start a conversation </p>
                <TiMessages className='text-3xl md:text-6xl text-center ' />
            </div>
        </div>
    )
}