import React, { useState, useEffect } from 'react'
import useConversation from '../../zustand/useConversation';
import useGetConversation from '../../hooks/useGetConversation';
import { useSocketContext } from '../../context/SocketContext';
import { toast } from 'react-hot-toast';

const SearchInput = () => {
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const { setSelectedConversation } = useConversation();
  const { conversations } = useGetConversation();
  const { onlineUsers } = useSocketContext();

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredUsers([]);
      return;
    }

    const filtered = conversations.filter((c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase())
    );

    // Sort: Online first, then by last message/activity
    filtered.sort((a, b) => {
      const isAOnline = onlineUsers.includes(a._id);
      const isBOnline = onlineUsers.includes(b._id);

      if (isAOnline && !isBOnline) return -1;
      if (!isAOnline && isBOnline) return 1;
      return 0; // Keep existing order (which is already sorted by activity from backend)
    });

    setFilteredUsers(filtered);
  }, [search, conversations, onlineUsers]);

  const handleSelect = (conversation) => {
    setSelectedConversation(conversation);
    setSearch("");
    setFilteredUsers([]);
  };

  return (
    <div className='relative w-full'>
      <form className='flex items-center gap-2' onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Search..."
          className="input input-bordered rounded-full w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type='submit' className='btn btn-circle bg-sky-500 text-white'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" /></svg>
        </button>
      </form>

      {/* Dropdown Suggestions */}
      {filteredUsers.length > 0 && (
        <ul className="absolute z-50 w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg mt-2 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700">
          {filteredUsers.map((user) => {
            const isOnline = onlineUsers.includes(user._id);
            // Assuming user object has a lastMessage property or similar from the backend populate
            const lastMsg = user.lastMessage?.message || "Start a conversation";

            return (
              <li
                key={user._id}
                onClick={() => handleSelect(user)}
                className="flex items-center gap-3 p-3 hover:bg-sky-100 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b last:border-b-0 border-gray-100 dark:border-gray-700"
              >
                <div className={`avatar ${isOnline ? 'online' : ''}`}>
                  <div className="w-10 rounded-full">
                    <img src={user.profilePic} alt={user.fullName} />
                  </div>
                </div>

                <div className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{user.fullName}</span>
                    {isOnline && <span className="text-xs text-green-500 font-bold">Online</span>}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{lastMsg}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  )
}

export default SearchInput