import { useSocketContext } from '../../context/SocketContext.jsx';
import useConversation from '../../zustand/useConversation.js';

const Conversation = ({ conversation, emoji, lastIdx }) => {
    const { selectedConversation, setSelectedConversation } = useConversation();

    const isSelected = selectedConversation?._id === conversation._id;
    const { onlineUsers } = useSocketContext();
    const isOnline = onlineUsers.includes(conversation._id);

    return (
        <>
            <div className={`flex gap-2 items-center hover:bg-sky-500 rounded p-2 py-1 cursor-pointer
            ${isSelected ? "bg-sky-500" : ""}
        `}
                onClick={() => setSelectedConversation(conversation)}
            >
                <div className={`avatar ${isOnline ? "online" : ""}`}>
                    <div className='w-12 rounded-full '>
                        <img src={conversation.profilePic} alt="User avatar" />
                    </div>
                </div>

                <div className='flex flex-col flex-1'>
                    <div className='flex gap-3 justify-between'>
                        <p className='font-bold text-gray-200'>{conversation.fullName}</p>
                        <span className='text-xl'>{emoji}</span>
                    </div>

                    <div className='flex justify-between items-center'>
                        <p className={`text-xs ${conversation.unreadCount > 0 ? 'text-white font-bold' : 'text-gray-400'} truncate max-w-[150px]`}>
                            {conversation.lastMessage?.message || "Start a conversation"}
                        </p>
                        {conversation.unreadCount > 0 && (
                            <span className='badge badge-sm badge-primary'>{conversation.unreadCount}</span>
                        )}
                    </div>
                </div>
            </div>

            {!lastIdx && <div className='divider my-0 py-0 h-1' ></div>}
        </>
    )
}

export default Conversation