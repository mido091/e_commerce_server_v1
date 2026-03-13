import db from "../config/db.js";

/**
 * POST /api/wishlist
 * Body: { product_id }
 */
export const addToWishlist = async (req, res, next) => {
  try {
    const { product_id } = req.body;
    const user_id = req.user.id;

    if (!product_id) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    // IGNORE if already exists (Unique constraint in DB will handle, but we can be graceful)
    await db.query(
      "INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)",
      [user_id, product_id]
    );

    return res.status(201).json({
      success: true,
      message: "Added to wishlist",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/wishlist
 * Returns the products in the user's wishlist
 */
export const getWishlist = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const [rows] = await db.query(
      `SELECT p.*, 
              (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as main_image,
              c.name as category_name, c.name_ar as category_name_ar
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       JOIN categories c ON p.category_id = c.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/wishlist/:productId
 */
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const user_id = req.user.id;

    await db.query(
      "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?",
      [user_id, productId]
    );

    return res.status(200).json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/wishlist/ids
 * Returns just the IDs of products in the wishlist (useful for frontend state)
 */
export const getWishlistIds = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const [rows] = await db.query(
      "SELECT product_id FROM wishlist WHERE user_id = ?",
      [user_id]
    );
    return res.status(200).json({
      success: true,
      ids: rows.map(r => r.product_id)
    });
  } catch (error) {
    next(error);
  }
};
