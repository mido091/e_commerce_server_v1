import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controllers.js";
import { verifyToken, verifyAdminOrOwner } from "../middlewares/auth.js";

const router = Router();

router.get("/stats", verifyToken, verifyAdminOrOwner, getDashboardStats);

export default router;
