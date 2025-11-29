import mongoose from "mongoose";


const conversationSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],

    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: [],
        }
    ],

    lastActivity: {
        type: Date,
        default: Date.now
    },

    typingUsers: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

// Add indexes for efficient polling
conversationSchema.index({ participants: 1, lastActivity: -1 });
conversationSchema.index({ updatedAt: -1 });


const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;