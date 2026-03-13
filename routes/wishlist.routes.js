import { Router } from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  getWishlistIds,
} from "../controllers/wishlist.controllers.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

// All wishlist routes require authentication
router.use(verifyToken);

router.post("/", addToWishlist);
router.get("/", getWishlist);
router.get("/ids", getWishlistIds);
router.delete("/:productId", removeFromWishlist);

export default router;
