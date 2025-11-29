import { useCallback } from 'react';
import { useSocketContext } from '../context/SocketContext';

const useMessageStatus = () => {
    const { socket } = useSocketContext();

    const markAsRead = useCallback(async (conversationId) => {
        if (!conversationId) return;

        try {
            // Optimistically update UI via socket if connected
            if (socket?.connected) {
                // Socket logic would go here if we had a specific event for it
                // For now we rely on the API call
            }

            const res = await fetch(`/api/polling/read/${conversationId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            return data.markedCount;
        } catch (error) {
            console.error("Error marking messages as read:", error);
        }
    }, [socket]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'read':
                return 'read'; // Blue double check
            case 'delivered':
                return 'delivered'; // Gray double check
            case 'sent':
            default:
                return 'sent'; // Gray single check
        }
    };

    return { markAsRead, getStatusIcon };
};

export default useMessageStatus;
