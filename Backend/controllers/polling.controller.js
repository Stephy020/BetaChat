import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

// Poll for new messages in a conversation
export const pollMessages = async (req, res) => {
    try {
        const { id: conversationId } = req.params;
        const { since } = req.query; // Timestamp of last received message
        const userId = req.user._id;

        // Verify user is part of the conversation
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: { $in: [userId] }
        });

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        // Build query for new messages
        let query = {
            _id: { $in: conversation.messages }
        };

        // If 'since' timestamp provided, only get newer messages
        if (since) {
            query.createdAt = { $gt: new Date(since) };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: 1 })
            .limit(50); // Limit to prevent excessive data transfer

        // Mark messages as delivered if user is receiver
        const messageIds = messages
            .filter(msg => msg.recieverId.toString() === userId.toString() && msg.deliveryStatus === 'sent')
            .map(msg => msg._id);

        if (messageIds.length > 0) {
            await Message.updateMany(
                { _id: { $in: messageIds } },
                { deliveryStatus: 'delivered' }
            );
        }

        res.status(200).json({
            messages: messages.map(msg => ({
                ...msg.toObject(),
                deliveryStatus: messageIds.includes(msg._id) ? 'delivered' : msg.deliveryStatus
            })),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.log("Error in pollMessages controller", error.message);
        res.status(500).json({ error: "Failed to poll messages" });
    }
};

// Poll for conversation updates
export const pollConversations = async (req, res) => {
    try {
        const { since } = req.query;
        const userId = req.user._id;

        let query = {
            participants: { $in: [userId] }
        };

        // If 'since' timestamp provided, only get updated conversations
        if (since) {
            query.updatedAt = { $gt: new Date(since) };
        }

        const conversations = await Conversation.find(query)
            .populate({
                path: 'messages',
                options: {
                    sort: { createdAt: -1 },
                    limit: 1 // Only get last message for preview
                }
            })
            .populate('participants', 'fullName profilePic')
            .sort({ updatedAt: -1 });

        // Calculate unread count for each conversation
        const conversationsWithUnread = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await Message.countDocuments({
                    _id: { $in: conv.messages },
                    recieverId: userId,
                    deliveryStatus: { $ne: 'read' }
                });

                return {
                    ...conv.toObject(),
                    unreadCount,
                    lastMessage: conv.messages[0] || null
                };
            })
        );

        res.status(200).json({
            conversations: conversationsWithUnread,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.log("Error in pollConversations controller", error.message);
        res.status(500).json({ error: "Failed to poll conversations" });
    }
};

// Update typing status
export const updateTypingStatus = async (req, res) => {
    try {
        const { id: conversationId } = req.params;
        const { isTyping } = req.body;
        const userId = req.user._id;

        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: { $in: [userId] }
        });

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        if (isTyping) {
            // Add or update typing status
            const existingIndex = conversation.typingUsers.findIndex(
                tu => tu.userId.toString() === userId.toString()
            );

            if (existingIndex >= 0) {
                conversation.typingUsers[existingIndex].timestamp = new Date();
            } else {
                conversation.typingUsers.push({
                    userId,
                    timestamp: new Date()
                });
            }
        } else {
            // Remove typing status
            conversation.typingUsers = conversation.typingUsers.filter(
                tu => tu.userId.toString() !== userId.toString()
            );
        }

        await conversation.save();

        res.status(200).json({ success: true });

    } catch (error) {
        console.log("Error in updateTypingStatus controller", error.message);
        res.status(500).json({ error: "Failed to update typing status" });
    }
};

// Get typing status
export const getTypingStatus = async (req, res) => {
    try {
        const { id: conversationId } = req.params;
        const userId = req.user._id;

        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: { $in: [userId] }
        }).populate('typingUsers.userId', 'fullName');

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        // Remove stale typing indicators (older than 5 seconds)
        const fiveSecondsAgo = new Date(Date.now() - 5000);
        conversation.typingUsers = conversation.typingUsers.filter(
            tu => tu.timestamp > fiveSecondsAgo
        );

        // Filter out current user from typing list
        const typingUsers = conversation.typingUsers
            .filter(tu => tu.userId._id.toString() !== userId.toString())
            .map(tu => ({
                userId: tu.userId._id,
                fullName: tu.userId.fullName
            }));

        res.status(200).json({ typingUsers });

    } catch (error) {
        console.log("Error in getTypingStatus controller", error.message);
        res.status(500).json({ error: "Failed to get typing status" });
    }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
    try {
        const { id: conversationId } = req.params;
        const userId = req.user._id;

        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: { $in: [userId] }
        });

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        // Mark all unread messages in this conversation as read
        const result = await Message.updateMany(
            {
                _id: { $in: conversation.messages },
                recieverId: userId,
                deliveryStatus: { $ne: 'read' }
            },
            {
                deliveryStatus: 'read',
                readAt: new Date()
            }
        );

        res.status(200).json({
            success: true,
            markedCount: result.modifiedCount
        });

    } catch (error) {
        console.log("Error in markMessagesAsRead controller", error.message);
        res.status(500).json({ error: "Failed to mark messages as read" });
    }
};
