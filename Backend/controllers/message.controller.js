import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getRecieverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res ) => {
    try {
        const { message }= req.body;
        const { id: recieverId } = req.params;
        const senderId = req.user._id;

        let conversation = await Conversation.findOne({
            participants: {$all: [senderId, recieverId]}
        })

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, recieverId],
            })
        }

        const newMessage = new Message({
            senderId,
            recieverId,
            message,
        })

        if(newMessage){
            conversation.messages.push(newMessage._id);
        }
// this will run in parrallel
       await Promise.all([conversation.save(), newMessage.save()]);

       //SOCKET.IO FUNCTIONALITY FOR REAL TIME MESSAGE
       const recieverSocketId = getRecieverSocketId(recieverId);
       if(recieverSocketId){
        //io.to sends event to a specific connected user
        io.to(recieverSocketId).emit("newMessage",newMessage);
       }

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage controller", error.message)
        res.status(500).json({error: "cant send message"});
    }
};


export const  getMessages = async (req, res) => {
    try {
       
       const {id:userToChatId} = req.params;
       const senderId = req.user._id;

       const conversation = await Conversation.findOne({
        participants: {$all: [senderId,userToChatId]},

       }).populate('messages');// NOT REFRENCE BUT ACTUAL MESSAGES

       if (!conversation) return res.status(200).json([]);

       const messages = conversation.messages;

       res.status(200).json(messages);

    } catch (error) {
        console.log("Error in getMessage controller", error.message)
        res.status(500).json({error: "cant get message"});
    }
}