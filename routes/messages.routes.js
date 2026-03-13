import { Router } from "express";
import {
  getMessages,
  createMessage,
  updateMessageStatus,
  deleteMessage,
} from "../controllers/messages.controllers.js";
import { verifyToken, verifyAdminOrOwner } from "../middlewares/auth.js";

const router = Router();

// Public: Send a message from the storefront Contact view
router.post("/", createMessage);

// Protected: Admin/Owner manage messages
router.get("/", verifyToken, verifyAdminOrOwner, getMessages);
router.put("/:id/status", verifyToken, verifyAdminOrOwner, updateMessageStatus);
router.delete("/:id", verifyToken, verifyAdminOrOwner, deleteMessage);

export default router;
