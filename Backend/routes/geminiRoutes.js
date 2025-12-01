import express from "express";
import { chatWithGemini } from "../controllers/gemini.controller.js";
import protectRoute from "../middlelayer/protectRoute.js";

const router = express.Router();

router.post("/chat", protectRoute, chatWithGemini);

export default router;
