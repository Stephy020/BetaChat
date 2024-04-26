import express from "express";
import { getUsersForSideBar } from "../controllers/user.controllers.js";
import protectRoute from "../middlelayer/protectRoute.js";

const router = express.Router();

router.get("/", protectRoute, getUsersForSideBar);

export default router;