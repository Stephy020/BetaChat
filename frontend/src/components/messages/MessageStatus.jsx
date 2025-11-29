import React from 'react';
import { BsCheck, BsCheckAll } from 'react-icons/bs';

const MessageStatus = ({ status }) => {
    if (!status) return null;

    switch (status) {
        case 'read':
            return <BsCheckAll className="text-blue-500 text-lg" title="Read" />;
        case 'delivered':
            return <BsCheckAll className="text-gray-400 text-lg" title="Delivered" />;
        case 'sent':
            return <BsCheck className="text-gray-400 text-lg" title="Sent" />;
        default:
            return null;
    }
};

export default MessageStatus;
