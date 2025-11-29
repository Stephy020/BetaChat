import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const getUsersForSideBar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // 1. Find all conversations involving the current user with messages
        const conversations = await Conversation.find({
            participants: { $in: [loggedInUserId] }
        })
            .sort({ updatedAt: -1 })
            .populate("participants", "-password")
            .populate({
                path: "messages",
                options: { sort: { createdAt: -1 }, limit: 1 }
            });

        // 2. Extract the *other* participant from each conversation with last message
        const sortedUsers = [];
        const seenUserIds = new Set();

        conversations.forEach(conversation => {
            conversation.participants.forEach(participant => {
                if (participant._id.toString() !== loggedInUserId.toString()) {
                    if (!seenUserIds.has(participant._id.toString())) {
                        // Add last message to the user object
                        const userWithMessage = {
                            ...participant.toObject(),
                            lastMessage: conversation.messages[0] || null
                        };
                        sortedUsers.push(userWithMessage);
                        seenUserIds.add(participant._id.toString());
                    }
                }
            });
        });

        // 3. Fetch remaining users who have no conversation yet
        const remainingUsers = await User.find({
            _id: {
                $ne: loggedInUserId,
                $nin: Array.from(seenUserIds)
            }
        }).select("-password");

        // Add null lastMessage for users with no conversation
        const remainingWithNull = remainingUsers.map(user => ({
            ...user.toObject(),
            lastMessage: null
        }));

        // 4. Combine sorted users with remaining users
        const finalUsers = [...sortedUsers, ...remainingWithNull];

        res.status(200).json(finalUsers);

    } catch (error) {
        console.log('Error getting users for sidebar', error.message);
        res.status(500).json({ error: "Internal error" });
    }
}