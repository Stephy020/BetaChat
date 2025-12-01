import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getSignedUploadUrl, deleteObject } from "../services/s3.service.js";

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

export const getProfileUploadUrl = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fileType } = req.query;

        if (!fileType) {
            return res.status(400).json({ error: "File type is required" });
        }

        const { signedUrl, key, publicUrl } = await getSignedUploadUrl(userId, "profile-pic", fileType);
        res.status(200).json({ signedUrl, key, publicUrl });
    } catch (error) {
        console.log("Error generating upload URL:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { profilePic } = req.body;

        if (!profilePic) {
            return res.status(400).json({ error: "Profile picture URL is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // If user already has a custom profile pic (not the default avatar), try to delete it
        if (user.profilePic && user.profilePic.includes(process.env.S3_BUCKET_NAME)) {
            try {
                // Extract key from URL. Assuming URL format: https://bucket.s3.region.amazonaws.com/key
                const urlParts = user.profilePic.split('.com/');
                if (urlParts.length > 1) {
                    const oldKey = urlParts[1];
                    await deleteObject(oldKey);
                }
            } catch (err) {
                console.log("Error deleting old profile pic:", err.message);
            }
        }

        user.profilePic = profilePic;
        await user.save();

        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        console.log("Error updating profile:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};