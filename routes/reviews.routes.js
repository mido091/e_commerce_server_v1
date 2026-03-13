import { Router } from "express";
import { verifyToken, verifyAdminOrOwner } from "../middlewares/auth.js";
import {
  createReview,
  getProductReviews,
  getAllReviews,
  toggleVisibility,
  deleteReview,
} from "../controllers/reviews.controllers.js";

const router = Router();

// ── Public ──────────────────────────────────────────────────────────
router.get("/product/:id", getProductReviews);

// ── Authenticated users ─────────────────────────────────────────────
router.post("/", verifyToken, createReview);

// ── Admin only ──────────────────────────────────────────────────────
router.get("/admin", verifyToken, verifyAdminOrOwner, getAllReviews);
router.patch("/:id/toggle", verifyToken, verifyAdminOrOwner, toggleVisibility);
router.delete("/:id", verifyToken, verifyAdminOrOwner, deleteReview);

export default router;
