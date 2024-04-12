import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { accessChat } from "../controllers/chats.js";

const router = express.Router();
//READ
//router.get("/", verifyToken, fetchChat);
//CREATE
router.post("/", verifyToken, accessChat);
//router.post("/group", verifyToken, createGroupChat);
//UPDATE
//router.patch("/renamegroup", verifyToken, renameGroupChat);
//router.patch("/removegroup", verifyToken, removeFromGroup);
//router.patch("/groupadd", verifyToken, addToGroup);

export default router;
