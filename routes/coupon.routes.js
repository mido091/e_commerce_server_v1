import { Router } from "express";
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "../controllers/coupon.controllers.js";
import { verifyToken, verifyAdminOrOwner } from "../middlewares/auth.js";

const router = Router();

// Public/User - Validate coupon
router.post("/validate", verifyToken, validateCoupon);

// Admin/Owner only - CRUD
router.get("/", verifyToken, verifyAdminOrOwner, getAllCoupons);
router.post("/", verifyToken, verifyAdminOrOwner, createCoupon);
router.patch("/:id", verifyToken, verifyAdminOrOwner, updateCoupon);
router.delete("/:id", verifyToken, verifyAdminOrOwner, deleteCoupon);

export default router;
