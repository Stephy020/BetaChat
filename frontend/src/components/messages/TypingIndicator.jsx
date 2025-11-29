import React from 'react';

const TypingIndicator = ({ typingUsers }) => {
    if (!typingUsers || typingUsers.length === 0) return null;

    const text = typingUsers.length === 1
        ? `${typingUsers[0].fullName} is typing...`
        : `${typingUsers.length} people are typing...`;

    return (
        <div className="flex items-center gap-2 px-4 py-2 text-xs text-gray-400 italic animate-pulse">
            <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
            </div>
            <span>{text}</span>
        </div>
    );
};

export default TypingIndicator;
