import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getRecieverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const { id: recieverId } = req.params;
        const senderId = req.user._id;

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, recieverId] }
        })

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, recieverId],
                lastActivity: new Date()
            })
        } else {
            conversation.lastActivity = new Date();
        }

        const newMessage = new Message({
            senderId,
            recieverId,
            message,
            deliveryStatus: 'sent'
        })

        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }
        // this will run in parrallel
        await Promise.all([conversation.save(), newMessage.save()]);

        //SOCKET.IO FUNCTIONALITY FOR REAL TIME MESSAGE
        const recieverSocketId = getRecieverSocketId(recieverId);
        if (recieverSocketId) {
            //io.to sends event to a specific connected user
            // Update delivery status to delivered if user is connected
            newMessage.deliveryStatus = 'delivered';
            await newMessage.save();

            io.to(recieverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage controller", error.message)
        res.status(500).json({ error: "cant send message" });
    }
};


export const getMessages = async (req, res) => {
    try {

        const { id: userToChatId } = req.params;
        const senderId = req.user._id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },

        }).populate('messages');// NOT REFRENCE BUT ACTUAL MESSAGES

        if (!conversation) return res.status(200).json([]);

        const messages = conversation.messages;

        // Mark unread messages as read
        const unreadMessageIds = messages
            .filter(msg => msg.recieverId.toString() === senderId.toString() && msg.deliveryStatus !== 'read')
            .map(msg => msg._id);

        if (unreadMessageIds.length > 0) {
            await Message.updateMany(
                { _id: { $in: unreadMessageIds } },
                { deliveryStatus: 'read', readAt: new Date() }
            );

            // Notify sender that messages were read (via socket if available)
            const recieverSocketId = getRecieverSocketId(userToChatId);
            if (recieverSocketId) {
                io.to(recieverSocketId).emit("messagesRead", unreadMessageIds);
            }
        }

        res.status(200).json(messages);

    } catch (error) {
        console.log("Error in getMessage controller", error.message)
        res.status(500).json({ error: "cant get message" });
    }
}