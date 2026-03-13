import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// ── verifyToken ────────────────────────────────────────────────────
// Validates the JWT (from HttpOnly Cookie or Bearer Header) and attaches decoded payload as req.user.
export const verifyToken = (req, res, next) => {
  // 1. Check Cookies (Primary)
  let token = req.cookies?.token;

  // 2. Fallback to Authorization Header
  if (!token) {
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
      token = header.split(" ")[1];
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ status: false, message: "Authentication required: No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  });
};

// ── verifyAdmin ────────────────────────────────────────────────────
// Allows only users with role = "admin" (NOT owner).
export const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ status: false, message: "Not authenticated" });
  }
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ status: false, message: "Access denied: admin only" });
  }
  next();
};

// ── verifyOwner ────────────────────────────────────────────────────
// Allows only users with role = "owner" (platform super-user).
export const verifyOwner = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ status: false, message: "Not authenticated" });
  }
  if (req.user.role !== "owner") {
    return res
      .status(403)
      .json({ status: false, message: "Access denied: owner only" });
  }
  next();
};

// ── verifyAdminOrOwner ─────────────────────────────────────────────
// Allows admin OR owner. Used for most protected management endpoints.
export const verifyAdminOrOwner = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ status: false, message: "Not authenticated" });
  }
  if (req.user.role !== "admin" && req.user.role !== "owner") {
    return res
      .status(403)
      .json({ status: false, message: "Access denied: admin or owner only" });
  }
  next();
};

// ── verifySelfOrAdmin ──────────────────────────────────────────────
// Allows the request when:
//   a) The authenticated user is operating on their OWN resource (id match), OR
//   b) The authenticated user is an admin or owner.
// Use this for endpoints like GET /users/:id or PATCH /users/:id.
export const verifySelfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ status: false, message: "Not authenticated" });
  }
  const isSelf = String(req.user.id) === String(req.params.id);
  const isPrivileged = req.user.role === "admin" || req.user.role === "owner";
  if (!isSelf && !isPrivileged) {
    return res
      .status(403)
      .json({
        status: false,
        message: "Access denied: you can only access your own resource",
      });
  }
  next();
};
