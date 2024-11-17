import React, { useEffect } from 'react'
import { useSocketContext } from '../context/SocketContext'
import useConversation from '../zustand/useConversation';
import  notification from "../assets/sound/noti.mp3"

const useListenMessages = () => {
   const {socket} = useSocketContext();
   const {messages, setMessages} = useConversation();
   const {selectedConversation, setSelectedConversation} = useConversation();


   

   useEffect(() => {
     socket?.on("newMessage",(newMessage) =>{
        newMessage.shouldShake = true;
        const sound  = new Audio(notification)
        sound.play();
        setMessages([...messages,newMessage])

        console.log("Message",newMessage);
        console.log("Message22",selectedConversation);
   
     })

     return () =>socket?.off("newMessage");
   }, [socket,setMessages,messages])
   
}

export default useListenMessages
