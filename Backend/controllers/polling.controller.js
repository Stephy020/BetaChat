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
        const { id: recipientIdOrConversationId } = req.params;
        const { isTyping } = req.body;
        const userId = req.user._id;

        // Try to find conversation - could be by conversation ID or by finding conversation with this user
        let conversation = await Conversation.findOne({
            _id: recipientIdOrConversationId,
            participants: { $in: [userId] }
        });

        // If not found by ID, try to find by participants (recipientId is actually a user ID)
        if (!conversation) {
            conversation = await Conversation.findOne({
                participants: { $all: [userId, recipientIdOrConversationId] }
            });
        }

        // If still not found, create a new conversation
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [userId, recipientIdOrConversationId],
                messages: [],
                typingUsers: []
            });
        }

        if (isTyping) {
            // Try to update existing entry first (atomic operation)
            const updated = await Conversation.findOneAndUpdate(
                { 
                    _id: conversation._id, 
                    "typingUsers.userId": userId 
                },
                { 
                    $set: { "typingUsers.$.timestamp": new Date() } 
                }
            );

            // If not found (user wasn't typing before), push new entry
            if (!updated) {
                await Conversation.findByIdAndUpdate(
                    conversation._id,
                    { 
                        $push: { 
                            typingUsers: { 
                                userId, 
                                timestamp: new Date() 
                            } 
                        } 
                    }
                );
            }
        } else {
            // Remove user from typing list (atomic operation)
            await Conversation.findByIdAndUpdate(
                conversation._id,
                { 
                    $pull: { 
                        typingUsers: { userId: userId } 
                    } 
                }
            );
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.log("Error in updateTypingStatus controller", error.message);
        res.status(500).json({ error: "Failed to update typing status" });
    }
};

// Get typing status
export const getTypingStatus = async (req, res) => {
    try {
        const { id: recipientIdOrConversationId } = req.params;
        const userId = req.user._id;

        // Try to find conversation - could be by conversation ID or by finding conversation with this user
        let conversation = await Conversation.findOne({
            _id: recipientIdOrConversationId,
            participants: { $in: [userId] }
        }).populate('typingUsers.userId', 'fullName');

        // If not found by ID, try to find by participants
        if (!conversation) {
            conversation = await Conversation.findOne({
                participants: { $all: [userId, recipientIdOrConversationId] }
            }).populate('typingUsers.userId', 'fullName');
        }

        if (!conversation) {
            // No conversation exists yet, return empty typing users
            return res.status(200).json({ typingUsers: [] });
        }

        // Remove stale typing indicators (older than 5 seconds)
        const fiveSecondsAgo = new Date(Date.now() - 5000);
        conversation.typingUsers = conversation.typingUsers.filter(
            tu => tu.timestamp > fiveSecondsAgo
        );

        // Filter out current user from typing list
        const typingUsers = conversation.typingUsers
            .filter(tu => tu.userId && tu.userId._id.toString() !== userId.toString())
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
