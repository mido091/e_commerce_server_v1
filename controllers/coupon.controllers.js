import db from "../config/db.js";
import { sendError, sendSuccess } from "../utils/apiError.js";

/**
 * GET /api/coupons
 * Admin/Owner — returns all coupons.
 */
export const getAllCoupons = async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT * FROM coupons ORDER BY created_at DESC");
    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/coupons
 * Admin/Owner — creates a new coupon.
 */
export const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      discount_type,
      discount_value,
      min_order_amount,
      expiry_date,
      max_uses,
    } = req.body;

    if (!code || !discount_type || !discount_value) {
      return sendError(res, 400, "VALIDATION_REQUIRED", "Required fields missing");
    }

    const [result] = await db.query(
      "INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, expiry_date, max_uses) VALUES (?, ?, ?, ?, ?, ?)",
      [code.toUpperCase(), discount_type, discount_value, min_order_amount || 0, expiry_date || null, max_uses || null]
    );

    sendSuccess(res, 201, {
      message: "Coupon created successfully",
      id: result.insertId,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return sendError(res, 400, "COUPON_CODE_EXISTS", "Coupon code already exists", { field: "code" });
    }
    next(error);
  }
};

/**
 * PATCH /api/coupons/:id
 * Admin/Owner — updates a coupon.
 */
export const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    
    if (Object.keys(fields).length === 0) {
       return sendError(res, 400, "VALIDATION_REQUIRED", "No fields to update");
    }

    const sets = Object.keys(fields).map(key => `${key} = ?`).join(", ");
    const values = Object.values(fields);

    await db.query(`UPDATE coupons SET ${sets} WHERE id = ?`, [...values, id]);

    sendSuccess(res, 200, {
      message: "Coupon updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/coupons/:id
 * Admin/Owner — deletes a coupon.
 */
export const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM coupons WHERE id = ?", [id]);
    sendSuccess(res, 200, {
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/coupons/validate
 * Public — validates a coupon code against current subtotal.
 */
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return sendError(res, 400, "COUPON_CODE_REQUIRED", "Coupon code is required", { field: "code" });
    }

    const [rows] = await db.query("SELECT * FROM coupons WHERE code = ? AND is_active = 1", [code.toUpperCase()]);
    
    if (rows.length === 0) {
      return sendError(res, 404, "COUPON_INVALID", "Invalid or inactive coupon code");
    }

    const coupon = rows[0];

    // Check expiry
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return sendError(res, 400, "COUPON_EXPIRED", "Coupon has expired");
    }

    // Check usage limit
    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      return sendError(res, 400, "COUPON_USAGE_LIMIT_REACHED", "Coupon usage limit reached");
    }

    // Check min order amount
    if (subtotal < coupon.min_order_amount) {
      return sendError(
        res,
        400,
        "COUPON_MIN_ORDER_NOT_MET",
        `Minimum order amount of ${coupon.min_order_amount} required to use this coupon`,
        { meta: { minOrderAmount: coupon.min_order_amount } },
      );
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (subtotal * coupon.discount_value) / 100;
    } else {
      discount = Math.min(coupon.discount_value, subtotal);
    }

    sendSuccess(res, 200, {
      message: "Coupon applied successfully",
      data: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: discount,
      }
    });
  } catch (error) {
    next(error);
  }
};
