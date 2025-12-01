import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSocketContext } from '../context/SocketContext';
import useConversation from '../zustand/useConversation';
import { soundManager } from '../utils/sound';
import { useNotification } from '../context/NotificationContext';

const useGetConversation = () => {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const { socket } = useSocketContext();
  const { selectedConversation } = useConversation();
  const { showNotification } = useNotification();

  useEffect(() => {
    const getConversations = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setConversations(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    getConversations();
  }, [])

  // Listen for new messages and update conversation list in real-time
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      newMessage.shouldShake = true;
      soundManager.playNotification();

      // Show in-app notification (works on ALL devices!)
      const senderName = conversations.find(c => c._id === newMessage.senderId)?.fullName || "Someone";
      if (showNotification) {
        showNotification(
          `New message from ${senderName}`,
          newMessage.message || "You have a new message!"
        );
      }

      // Legacy system notification (only if supported)
      if (typeof Notification !== 'undefined' && document.visibilityState === "hidden" && Notification.permission === "granted") {
        new Notification("New Message", {
          body: newMessage.message || "You have a new message!",
          icon: "/vite.svg",
          tag: "new-message"
        });
      }

      setConversations((prevConversations) => {
        // Find the conversation with the sender or receiver
        const updatedConversations = prevConversations.map(conv => {
          if (conv._id === newMessage.senderId || conv._id === newMessage.recieverId) {
            const isSender = newMessage.senderId === conv._id;
            const isSelected = selectedConversation?._id === conv._id;

            return {
              ...conv,
              lastMessage: newMessage,
              unreadCount: isSender && !isSelected ? (conv.unreadCount || 0) + 1 : conv.unreadCount
            };
          }
          return conv;
        });

        // Sort: move the updated conversation to the top
        return updatedConversations.sort((a, b) => {
          if (a._id === newMessage.senderId || a._id === newMessage.recieverId) return -1;
          if (b._id === newMessage.senderId || b._id === newMessage.recieverId) return 1;
          return 0;
        });
      });
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedConversation, conversations, showNotification]);

  // Clear unread count when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      setConversations(prev => prev.map(conv => {
        if (conv._id === selectedConversation._id) {
          return { ...conv, unreadCount: 0 };
        }
        return conv;
      }));
    }
  }, [selectedConversation]);

  // Polling fallback when socket is disconnected
  useEffect(() => {
    if (!socket || socket.connected) return;

    console.log("Socket disconnected. Starting conversation list polling...");

    const pollConversations = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (!data.error) {
          setConversations(data);
        }
      } catch (error) {
        console.error("Conversation polling error:", error);
      }
    };

    // Initial poll
    pollConversations();

    // Poll every 5 seconds
    const interval = setInterval(pollConversations, 5000);

    return () => clearInterval(interval);
  }, [socket, socket?.connected]);

  return { loading, conversations }
}

export default useGetConversation;
