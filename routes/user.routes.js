import { Router } from "express";
import upload from "../middlewares/upload.js";
import {
  verifyToken,
  verifyAdminOrOwner,
  verifySelfOrAdmin,
} from "../middlewares/auth.js";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/AuthController.js";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controllers.js";
import { authLimiter } from "../middlewares/security.js";

const router = Router();

// ── Public ─────────────────────────────────────────────────────────
// Registration accepts an optional profile image
router.post("/register", authLimiter, upload.single("image"), registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/logout", logoutUser);

// ── Protected: self or admin/owner ─────────────────────────────────
// GET  /users/:id  — user can fetch their own profile; admins can fetch any
router.get("/:id", verifyToken, verifySelfOrAdmin, getUserById);

// PATCH /users/:id — user can update their own profile; admins can update any
const handleUpload = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("[Multer] Upload error:", err.message);
      return next(err);
    }
    next();
  });
};

router.patch(
  "/:id",
  verifyToken,
  verifySelfOrAdmin,
  handleUpload,
  updateUser,
);

// PUT   /users/:id — alias for PATCH (frontend ProfilePage.vue uses PUT)
router.put(
  "/:id",
  verifyToken,
  verifySelfOrAdmin,
  handleUpload,
  updateUser,
);

// ── Protected: admin or owner only ─────────────────────────────────
// GET  /users/    — list all users
router.get("/", verifyToken, verifyAdminOrOwner, getAllUsers);

// DELETE /users/:id — remove a user account
router.delete("/:id", verifyToken, verifyAdminOrOwner, deleteUser);

export default router;
