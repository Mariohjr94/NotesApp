import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { sendMessage } from "../controllers/messages.js";
import { allMessages } from "../controllers/messages.js";
import { readMessage } from "../controllers/messages.js";

const router = express.Router();

router.post("/", verifyToken, sendMessage);
router.get("/:chatId", verifyToken, allMessages);
router.patch("/read/:chatId/", verifyToken, readMessage);

export default router;
