import db from "../config/db.js";
import { sendError, sendSuccess } from "../utils/apiError.js";

// GET /api/messages (Admin only)
export const getMessages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      "SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [limit, offset],
    );

    const [[{ total }]] = await db.query(
      "SELECT COUNT(*) as total FROM contact_messages",
    );

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/messages (Public - Contact Us form)
export const createMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return sendError(res, 400, "VALIDATION_REQUIRED", "All fields are required");
    }

    await db.query(
      "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
      [name, email, subject, message],
    );

    sendSuccess(res, 201, { message: "Message sent successfully" });
  } catch (error) {
    next(error);
  }
};

// PUT /api/messages/:id/status (Admin - Read/Unread/Archive toggle)
export const updateMessageStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["read", "unread", "archived"].includes(status)) {
      return sendError(res, 400, "MESSAGE_STATUS_INVALID", "Invalid status", { field: "status" });
    }

    await db.query("UPDATE contact_messages SET status = ? WHERE id = ?", [
      status,
      id,
    ]);

    sendSuccess(res, 200, { message: "Message status updated" });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/messages/:id (Admin only)
export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM contact_messages WHERE id = ?", [id]);
    sendSuccess(res, 200, { message: "Message deleted" });
  } catch (error) {
    next(error);
  }
};
