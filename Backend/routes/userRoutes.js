import express from "express";
import { getUsersForSideBar, getProfileUploadUrl, updateUserProfile } from "../controllers/user.controllers.js";
import protectRoute from "../middlelayer/protectRoute.js";

const router = express.Router();

router.get("/", protectRoute, getUsersForSideBar);
router.get("/profile-url", protectRoute, getProfileUploadUrl);
router.post("/profile", protectRoute, updateUserProfile);

export default router;