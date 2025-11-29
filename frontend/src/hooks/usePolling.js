import { useEffect, useRef } from 'react';
import { useSocketContext } from '../context/SocketContext';
import useConversation from '../zustand/useConversation';
import notification from "../assets/sound/noti.mp3";

const usePolling = () => {
    const { socket } = useSocketContext();
    const { messages, setMessages, selectedConversation } = useConversation();
    const intervalRef = useRef(null);

    useEffect(() => {
        // Function to poll for new messages
        const pollMessages = async () => {
            if (!selectedConversation) return;

            try {
                // Get the timestamp of the last message to only fetch newer ones
                const lastMessage = messages[messages.length - 1];
                const since = lastMessage ? lastMessage.createdAt : null;

                const queryParams = new URLSearchParams();
                if (since) queryParams.append('since', since);

                const res = await fetch(`/api/polling/messages/${selectedConversation._id}?${queryParams.toString()}`);
                const data = await res.json();

                if (data.error) throw new Error(data.error);

                if (data.messages && data.messages.length > 0) {
                    // Play sound for new messages
                    const sound = new Audio(notification);
                    sound.play();

                    // Update messages state
                    setMessages([...messages, ...data.messages]);

                    // Trigger notification if background
                    if (document.visibilityState === "hidden" && Notification.permission === "granted") {
                        new Notification("New Message", {
                            body: "You have new messages",
                            icon: "/vite.svg"
                        });
                    }
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
        };

        // Start polling only if socket is disconnected or undefined
        const startPolling = () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = setInterval(pollMessages, 3000); // Poll every 3 seconds
            console.log("Socket disconnected. Polling started.");
        };

        const stopPolling = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                console.log("Socket connected. Polling stopped.");
            }
        };

        // Check connection status
        if (!socket || !socket.connected) {
            startPolling();
        } else {
            stopPolling();
        }

        // Listen for connection events to toggle polling
        if (socket) {
            socket.on('disconnect', startPolling);
            socket.on('connect', stopPolling);
        }

        return () => {
            stopPolling();
            if (socket) {
                socket.off('disconnect', startPolling);
                socket.off('connect', stopPolling);
            }
        };
    }, [socket, selectedConversation, messages, setMessages]);

    return null;
};

export default usePolling;
