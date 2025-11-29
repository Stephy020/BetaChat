import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useSocketContext } from '../context/SocketContext';

const useGetConversation = () => {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const { socket } = useSocketContext();

  useEffect(() => {
    const getConversations = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/users");
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
      setConversations((prevConversations) => {
        // Find the conversation with the sender or receiver
        const updatedConversations = prevConversations.map(conv => {
          if (conv._id === newMessage.senderId || conv._id === newMessage.recieverId) {
            return {
              ...conv,
              lastMessage: newMessage
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
  }, [socket]);

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

export default useGetConversation
