import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerSchema, loginSchema } from "../validators/user.schema.js";
import validator from "validator";
import { sendError, sendSuccess } from "../utils/apiError.js";

// ── Cookie Options ────────────────────────────────────────────────
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ── registerUser ───────────────────────────────────────────────────
export const registerUser = async (req, res, next) => {
  try {
    const validation = registerSchema.safeParse(req.body || {});
    if (!validation.success) {
      const issue = validation.error.issues[0];
      const message = issue.message;
      let code = "VALIDATION_REQUIRED";
      let field = issue.path?.[0] || null;

      if (message.toLowerCase().includes("email")) code = "VALIDATION_INVALID_EMAIL";
      else if (message.toLowerCase().includes("mobile")) code = "VALIDATION_INVALID_PHONE_EG";
      else if (message.toLowerCase().includes("uppercase")) code = "AUTH_PASSWORD_UPPERCASE_REQUIRED";
      else if (message.toLowerCase().includes("number")) code = "AUTH_PASSWORD_NUMBER_REQUIRED";
      else if (message.toLowerCase().includes("8 characters")) code = "AUTH_PASSWORD_TOO_SHORT";

      return sendError(res, 400, code, message, { field });
    }

    let { name, email, password, phone } = validation.data;

    // Sanitize inputs
    name = validator.escape(name.trim());
    email = validator.normalizeEmail(email.trim());

    // Check for duplicate email
    const [emailRows] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (emailRows.length > 0) {
      return sendError(res, 400, "AUTH_EMAIL_EXISTS", "Email already exists", { field: "email" });
    }

    // Check for duplicate phone
    const [phoneRows] = await db.query("SELECT id FROM users WHERE phone = ?", [phone]);
    if (phoneRows.length > 0) {
      return sendError(res, 400, "AUTH_PHONE_EXISTS", "Phone number already exists", { field: "phone" });
    }

    const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds for security

    const role = "user";
    const image = req.file?.path || "https://res.cloudinary.com/ddqlt5oqu/image/upload/v1764967019/default_pi1ur8.webp";

    const [result] = await db.query(
      "INSERT INTO users (name, email, password_hash, phone, role, image) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, phone, role, image]
    );

    if (result.affectedRows === 0) {
      return sendError(res, 500, "AUTH_REGISTER_FAILED", "Registration failed");
    }

    return sendSuccess(res, 201, { message: "User registered successfully" });
  } catch (error) {
    next(error);
  }
};

// ── loginUser ──────────────────────────────────────────────────────
export const loginUser = async (req, res, next) => {
  try {
    const validation = loginSchema.safeParse(req.body || {});
    if (!validation.success) {
      const issue = validation.error.issues[0];
      const message = issue.message;
      let code = "VALIDATION_REQUIRED";
      let field = issue.path?.[0] || null;
      if (message.toLowerCase().includes("email")) code = "VALIDATION_INVALID_EMAIL";
      return sendError(res, 400, code, message, { field });
    }

    const { email, password } = validation.data;
    const sanitizedEmail = validator.normalizeEmail(email.trim());

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [sanitizedEmail]);
    if (rows.length === 0) {
      return sendError(res, 401, "AUTH_INVALID_CREDENTIALS", "Invalid credentials");
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return sendError(res, 401, "AUTH_INVALID_CREDENTIALS", "Invalid credentials");
    }

    const publicUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      image: user.image,
    };

    const token = jwt.sign(publicUser, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set JWT as HttpOnly cookie
    res.cookie("token", token, cookieOptions);

    return sendSuccess(res, 200, {
      message: "Login successful",
      user: publicUser,
    });
  } catch (error) {
    next(error);
  }
};

// ── logoutUser ─────────────────────────────────────────────────────
export const logoutUser = (req, res) => {
  res.cookie("token", "", { ...cookieOptions, maxAge: 0, expires: new Date(0) });
  return sendSuccess(res, 200, { message: "Logged out successfully" });
};
