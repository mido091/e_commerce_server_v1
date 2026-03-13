import { Router } from "express";
import {
  getAllOrders,
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
} from "../controllers/orders.controllers.js";
import { verifyToken, verifyAdminOrOwner } from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";

const router = Router();

// Protected — owner/admin only
router.get("/", verifyToken, verifyAdminOrOwner, getAllOrders);

// Protected — logged-in users only
router.get("/my-orders", verifyToken, getUserOrders);

// Get specific order by ID (Tracker)
router.get("/:id/track", verifyToken, getOrderById);

// Create order (accepts multipart/form-data for receipts)
router.post("/", verifyToken, upload.single("screenshot"), createOrder);

// Admin updates order status
router.put("/:id/status", verifyToken, verifyAdminOrOwner, updateOrderStatus);

export default router;
