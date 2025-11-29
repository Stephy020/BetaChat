import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    recieverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true

    },

    message: {
        type: String,
        required: true
    },

    deliveryStatus: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },

    readAt: {
        type: Date,
        default: null
    },

    // created at and updated at 
}, { timestamps: true });

// Add indexes for efficient polling queries
messageSchema.index({ createdAt: 1 });
messageSchema.index({ senderId: 1, recieverId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;