import React, { useState, useEffect, useCallback, useRef } from 'react'
import useConversation from '../zustand/useConversation';
import { toast } from "react-hot-toast"
import usePolling from './usePolling';
import { usePollingContext } from '../context/PollingContext';

const useGetMessages = () => {
    const [loading, setLoading] = useState(false);
    const { messages, setMessages, selectedConversation } = useConversation();
    const { isPollingEnabled, pollingInterval } = usePollingContext();
    const lastMessageRef = useRef(null);

    // Initial fetch
    useEffect(() => {
        const getMessages = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/messages/${selectedConversation._id}`)
                const data = await res.json();
                if (data.error) throw new Error(data.error);

                setMessages(data)
            } catch (error) {
                toast.error(error.message)
            } finally {
                setLoading(false)
            }
        }
        if (selectedConversation?._id) getMessages();
    }, [selectedConversation?._id, setMessages])

    // Update last message ref for polling
    useEffect(() => {
        if (messages.length > 0) {
            lastMessageRef.current = messages[messages.length - 1];
        }
    }, [messages]);

    // Polling function
    const pollNewMessages = useCallback(async () => {
        if (!selectedConversation?._id || !lastMessageRef.current) return;

        try {
            const lastTimestamp = lastMessageRef.current.createdAt;
            const res = await fetch(`/api/polling/messages/${selectedConversation._id}?since=${lastTimestamp}`);
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            if (data.messages && data.messages.length > 0) {
                // Filter out duplicates just in case
                const newMessages = data.messages.filter(
                    newMsg => !messages.some(existingMsg => existingMsg._id === newMsg._id)
                );

                if (newMessages.length > 0) {
                    setMessages([...messages, ...newMessages]);
                }
            }
        } catch (error) {
            console.error("Polling error:", error);
        }
    }, [selectedConversation?._id, messages, setMessages]);

    // Enable polling
    usePolling(
        pollNewMessages,
        pollingInterval,
        isPollingEnabled && !!selectedConversation?._id,
        [selectedConversation?._id, messages]
    );

    return { messages, loading }
}

export default useGetMessages
