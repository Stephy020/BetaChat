import React, { useEffect } from 'react'
import { useSocketContext } from '../context/SocketContext'
import useConversation from '../zustand/useConversation';
import notification from "../assets/sound/noti.mp3"

const useListenMessages = () => {
   const { socket } = useSocketContext();
   const { messages, setMessages } = useConversation();
   const { selectedConversation, setSelectedConversation } = useConversation();




   useEffect(() => {
      // Request notification permission on mount
      if (Notification.permission !== "granted") {
         Notification.requestPermission();
      }

      socket?.on("newMessage", (newMessage) => {
         newMessage.shouldShake = true;
         const sound = new Audio(notification)
         sound.play();
         setMessages([...messages, newMessage])

         // Trigger system notification if app is in background
         if (document.visibilityState === "hidden" && Notification.permission === "granted") {
            new Notification("New Message", {
               body: newMessage.message || "You have a new message!",
               icon: "/vite.svg", // Optional: Add your app icon path here
               tag: "new-message" // Prevents notification stacking if desired
            });
         }

         console.log("Message", newMessage);
         console.log("Message22", selectedConversation);

      })

      return () => socket?.off("newMessage");
   }, [socket, setMessages, messages])

}

export default useListenMessages
