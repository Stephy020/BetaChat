import express from "express";
import protectRoute from "../middlelayer/protectRoute.js";
import {
    pollMessages,
    pollConversations,
    updateTypingStatus,
    getTypingStatus,
    markMessagesAsRead
} from "../controllers/polling.controller.js";

const router = express.Router();

// Poll for new messages in a conversation
router.get("/messages/:id", protectRoute, pollMessages);

// Poll for conversation updates
router.get("/conversations", protectRoute, pollConversations);

// Update typing status
router.post("/typing/:id", protectRoute, updateTypingStatus);

// Get typing status
router.get("/typing/:id", protectRoute, getTypingStatus);

// Mark messages as read
router.post("/read/:id", protectRoute, markMessagesAsRead);

export default router;
