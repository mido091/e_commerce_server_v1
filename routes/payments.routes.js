import { Router } from "express";
import {
  getPendingPayments,
  uploadProof,
  verifyPayment,
} from "../controllers/payments.controllers.js";
import { verifyToken, verifyAdminOrOwner } from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";

const router = Router();

// Protected — owner/admin only
router.get(
  "/admin/pending",
  verifyToken,
  verifyAdminOrOwner,
  getPendingPayments,
);

// User uploads receipt
router.post("/proof", verifyToken, upload.single("screenshot"), uploadProof);

// Admin verifies payment
router.put("/:id/verify", verifyToken, verifyAdminOrOwner, verifyPayment);

export default router;
