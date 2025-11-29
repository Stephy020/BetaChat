import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import usePolling from './usePolling';

const useTypingIndicator = (conversationId) => {
    const [typingUsers, setTypingUsers] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const { authUser } = useAuthContext();

    // Poll for other users typing
    const fetchTypingStatus = useCallback(async () => {
        if (!conversationId) return;

        try {
            const res = await fetch(`/api/polling/typing/${conversationId}`);
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            setTypingUsers(data.typingUsers || []);
        } catch (error) {
            console.error("Error fetching typing status:", error);
        }
    }, [conversationId]);

    // Poll every 2 seconds for typing status
    usePolling(fetchTypingStatus, 2000, !!conversationId, [conversationId]);

    // Function to report current user is typing
    const reportTyping = useCallback(async (typing) => {
        if (!conversationId) return;

        try {
            await fetch(`/api/polling/typing/${conversationId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isTyping: typing })
            });
        } catch (error) {
            console.error("Error reporting typing status:", error);
        }
    }, [conversationId]);

    // Handle local typing event
    const handleTyping = useCallback(() => {
        if (!isTyping) {
            setIsTyping(true);
            reportTyping(true);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            reportTyping(false);
        }, 2000); // Stop typing after 2 seconds of inactivity
    }, [isTyping, reportTyping]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            if (isTyping) {
                reportTyping(false);
            }
        };
    }, [isTyping, reportTyping]);

    return { typingUsers, handleTyping };
};

export default useTypingIndicator;
