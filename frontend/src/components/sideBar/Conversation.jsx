import { useSocketContext } from '../../context/SocketContext.jsx';
import useGetMessages from '../../hooks/useGetMessages.js';
import useConversation from '../../zustand/useConversation.js';

const Conversation = ({ conversation, emoji, lastIdx }) => {
    const { selectedConversation, setSelectedConversation } = useConversation();
    const { messages, loading } = useGetMessages();

    const isSelected = selectedConversation?._id === conversation._id;
    const { onlineUsers } = useSocketContext();
    const isOnline = onlineUsers.includes(conversation._id);

    return (
        <>
            <div className={`flex gap-2 items-center hover:bg-sky-500 rounded p-2 py-1 cursor-pointer
            ${isSelected ? "bg-sky-500" : ""}
        `}
                onClick={() => {
                    console.log('Attempting to set selected conversation with:', conversation);
                    setSelectedConversation(conversation);
                }}
            >
                <div className={`avatar ${isOnline ? "online" : ""}`}>
                    <div className='w-12 rounded-full '>
                        <img src={conversation.profilePic} alt="User avatar" />
                    </div>
                </div>

                <div className='flex flex-col flex-1'>
                    <div className='flex gap-3 justify-between' >
                        <div className='flex flex-col overflow-hidden'>
                            <p className='font-bold text-gray-200'>{conversation.fullName}</p>
                            <small className='text-gray-400 text-xs truncate'>
                                {conversation.lastMessage?.message || ""}
                            </small>
                        </div>

                        <span className='text-xl'>{emoji}</span>
                    </div>
                </div>
            </div>
            {!lastIdx ? <div className='divider my-0 py-0 h-1' ></div> : null}
        </>
    )
}

export default Conversation