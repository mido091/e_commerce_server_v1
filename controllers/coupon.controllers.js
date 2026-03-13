import db from "../config/db.js";

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
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    const [result] = await db.query(
      "INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, expiry_date, max_uses) VALUES (?, ?, ?, ?, ?, ?)",
      [code.toUpperCase(), discount_type, discount_value, min_order_amount || 0, expiry_date || null, max_uses || null]
    );

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      id: result.insertId,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: "Coupon code already exists" });
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
       return res.status(400).json({ success: false, message: "No fields to update" });
    }

    const sets = Object.keys(fields).map(key => `${key} = ?`).join(", ");
    const values = Object.values(fields);

    await db.query(`UPDATE coupons SET ${sets} WHERE id = ?`, [...values, id]);

    res.status(200).json({
      success: true,
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
    res.status(200).json({
      success: true,
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
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }

    const [rows] = await db.query("SELECT * FROM coupons WHERE code = ? AND is_active = 1", [code.toUpperCase()]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Invalid or inactive coupon code" });
    }

    const coupon = rows[0];

    // Check expiry
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ success: false, message: "Coupon has expired" });
    }

    // Check usage limit
    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
    }

    // Check min order amount
    if (subtotal < coupon.min_order_amount) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum order amount of ${coupon.min_order_amount} required to use this coupon` 
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (subtotal * coupon.discount_value) / 100;
    } else {
      discount = Math.min(coupon.discount_value, subtotal);
    }

    res.status(200).json({
      success: true,
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
