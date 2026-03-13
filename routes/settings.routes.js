import { Router } from "express";
import {
  getSettings,
  updateSettings,
} from "../controllers/settings.controllers.js";
import { verifyToken, verifyOwner } from "../middlewares/auth.js";
import { logoUpload } from "../middlewares/upload.js";

const router = Router();

// Public — any visitor can read site settings
router.get("/", getSettings);

// Protected — only the Owner can change settings
router.put(
  "/",
  verifyToken,
  verifyOwner,
  logoUpload.fields([
    { name: "logo", maxCount: 1 },
    { name: "footer_logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
  ]),
  updateSettings,
);

export default router;
