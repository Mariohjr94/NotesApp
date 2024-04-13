import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { accessChat } from "../controllers/chats.js";
import { fetchChats } from "../controllers/chats.js";
import { createGroupChat } from "../controllers/chats.js";
import { renameGroup } from "../controllers/chats.js";
import { removeFromGroup } from "../controllers/chats.js";
import { addToGroup } from "../controllers/chats.js";

const router = express.Router();
//READ
router.get("/", verifyToken, fetchChats);
//CREATE
router.post("/", verifyToken, accessChat);
router.post("/group", verifyToken, createGroupChat);
//UPDATE
router.patch("/rename", verifyToken, renameGroup);
router.patch("/removefromgroup", verifyToken, removeFromGroup);
router.patch("/groupadd", verifyToken, addToGroup);

export default router;
