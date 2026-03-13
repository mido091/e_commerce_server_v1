import db from "../config/db.js";

// ── GET /api/orders (Admin/Owner) ──────────────────────────────────
export const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const search = req.query.search || "";
    const status = req.query.status || "";

    let whereSql = "1=1";
    let queryParams = [];

    if (status) {
      whereSql += " AND o.status = ?";
      queryParams.push(status);
    }

    if (search) {
      whereSql += " AND (u.name LIKE ? OR u.email LIKE ? OR o.id = ?)";
      const searchLike = `%${search}%`;
      const searchId = isNaN(search) ? 0 : parseInt(search);
      queryParams.push(searchLike, searchLike, searchId);
    }

    // Get total count for pagination
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE ${whereSql}`,
      queryParams,
    );

    // Get orders with user details
    const query = `
      SELECT o.id, o.status, o.payment_status, o.payment_method, o.payment_receipt_url, o.transaction_id, o.total_price, o.created_at, o.shipping_phone, o.shipping_address,
             u.name, u.email, u.phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE ${whereSql}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [orders] = await db.query(query, [...queryParams, limit, offset]);

    // Fetch and attach items
    if (orders.length > 0) {
      const orderIds = orders.map((o) => o.id);
      const [items] = await db.query(
        `SELECT oi.order_id, oi.quantity, oi.price, p.name as product_name, p.name_ar as product_name_ar,
                (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as main_image
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id IN (?)`,
        [orderIds],
      );

      const itemsByOrder = items.reduce((acc, item) => {
        acc[item.order_id] = acc[item.order_id] || [];
        acc[item.order_id].push(item);
        return acc;
      }, {});

      orders.forEach((o) => {
        o.items = itemsByOrder[o.id] || [];
      });
    }

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/orders/my-orders (Self) ────────────────────────────────
export const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [[{ total }]] = await db.query(
      "SELECT COUNT(*) as total FROM orders WHERE user_id = ?",
      [userId],
    );

    const query = `
      SELECT id, status, payment_status, payment_method, total_price, created_at,
             rejection_reason, shipping_phone, shipping_address
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [orders] = await db.query(query, [userId, limit, offset]);

    if (orders.length > 0) {
      const orderIds = orders.map((o) => o.id);
      const [items] = await db.query(
        `SELECT oi.order_id, oi.quantity, oi.price, p.name as product_name, p.name_ar as product_name_ar,
                (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as main_image
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id IN (?)`,
        [orderIds],
      );

      const itemsByOrder = items.reduce((acc, item) => {
        acc[item.order_id] = acc[item.order_id] || [];
        acc[item.order_id].push(item);
        return acc;
      }, {});

      orders.forEach((o) => {
        o.items = itemsByOrder[o.id] || [];
      });
    }

    res.status(200).json({
      success: true,
      message: "Your orders retrieved successfully",
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/orders/:id (Self/Admin Single Order Fetch) ─────────────
export const getOrderById = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin" || req.user.role === "owner";

    let query = `
      SELECT id, status, payment_status, payment_method, total_price, created_at, rejection_reason, payment_receipt_url, shipping_phone, shipping_address
      FROM orders
      WHERE id = ?
    `;
    const params = [orderId];

    if (!isAdmin) {
      query += " AND user_id = ?";
      params.push(userId);
    }

    const [[order]] = await db.query(query, params);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const [items] = await db.query(
      `SELECT oi.order_id, oi.quantity, oi.price, p.name as product_name, p.name_ar as product_name_ar,
              (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as main_image
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId],
    );

    order.items = items || [];

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/orders (Create Order from Cart) ─────────────────────
export const createOrder = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const userId = req.user.id;
    let {
      items,
      total_price,
      payment_method,
      reference,
      shipping_phone,
      shipping_address,
      coupon_code,
    } = req.body || {};

    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch (e) {
        items = [];
      }
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      await connection.release();
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // ── Egyptian Phone Validation ──
    if (!shipping_phone || !/^01[0125][0-9]{8}$/.test(shipping_phone)) {
      await connection.release();
      return res.status(400).json({
        success: false,
        message:
          "A valid Egyptian phone number is required (e.g., 01012345678).",
      });
    }

    // Address Validation
    if (!shipping_address || shipping_address.trim().length < 5) {
      await connection.release();
      return res.status(400).json({
        success: false,
        message: "A valid shipping address is required.",
      });
    }

    const validatedPaymentMethod = ["wallet", "instapay", "cod"].includes(
      payment_method,
    )
      ? payment_method
      : "wallet";

    if (
      (validatedPaymentMethod === "wallet" ||
        validatedPaymentMethod === "instapay") &&
      !req.file
    ) {
      await connection.release();
      return res.status(400).json({
        success: false,
        message:
          "Receipt screenshot is required for Electronic Wallet and InstaPay payments.",
      });
    }

    // 1. Begin transaction
    await connection.beginTransaction();

    let finalTotalPrice = total_price;
    let validatedCouponCode = null;

    // 1.5 Handle Coupon Validation
    if (coupon_code) {
      const [couponRows] = await connection.query(
        "SELECT * FROM coupons WHERE code = ? AND is_active = 1 FOR UPDATE",
        [coupon_code.toUpperCase()]
      );

      if (couponRows.length > 0) {
        const coupon = couponRows[0];
        const now = new Date();
        const isExpired = coupon.expiry_date && new Date(coupon.expiry_date) < now;
        const reachedLimit = coupon.max_uses !== null && coupon.used_count >= coupon.max_uses;
        
        // Calculate subtotal from items to prevent total_price tampering
        const subtotal = items.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);

        if (!isExpired && !reachedLimit && subtotal >= coupon.min_order_amount) {
           let discount = 0;
           if (coupon.discount_type === 'percentage') {
             discount = (subtotal * coupon.discount_value) / 100;
           } else {
             discount = Math.min(coupon.discount_value, subtotal);
           }
           
           finalTotalPrice = Math.max(0, subtotal - discount);
           validatedCouponCode = coupon.code;

           // Increment used count
           await connection.query(
             "UPDATE coupons SET used_count = used_count + 1 WHERE id = ?",
             [coupon.id]
           );
        } else {
           // If coupon is invalid, we return 400
           await connection.rollback();
           connection.release();
           return res.status(400).json({ success: false, message: "Applied coupon is no longer valid" });
        }
      } else {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ success: false, message: "Invalid coupon code" });
      }
    }

    const receiptUrl = req.file ? req.file.path : null;
    const paymentStatus =
      validatedPaymentMethod === "cod" ? "unpaid" : "pending_verification";

    // 2. Insert into orders table
    const [orderResult] = await connection.query(
      "INSERT INTO orders (user_id, total_price, coupon_code, status, payment_status, payment_method, payment_receipt_url, transaction_id, shipping_phone, shipping_address) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)",
      [
        userId,
        finalTotalPrice,
        validatedCouponCode,
        paymentStatus,
        validatedPaymentMethod,
        receiptUrl,
        reference || null,
        shipping_phone,
        shipping_address,
      ],
    );
    const orderId = orderResult.insertId;

    // 3. Insert into order_items table
    const orderItemsValues = items.map((item) => [
      orderId,
      item.id,
      item.quantity,
      item.price,
    ]);

    await connection.query(
      "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?",
      [orderItemsValues],
    );

    // 4. Commit transaction
    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: { order_id: orderId },
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// ── PUT /api/orders/:id/status (Admin) ──────────────────────────
export const updateOrderStatus = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const validStatuses = [
      "pending",
      "confirmed",
      "verified",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "rejected",
      "problem",
    ];
    if (!validStatuses.includes(status)) {
      await connection.release();
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    await connection.beginTransaction();

    // Select current status & method to prevent double stock deduction
    const [[currentOrder]] = await connection.query(
      "SELECT status, payment_method FROM orders WHERE id = ? FOR UPDATE",
      [orderId],
    );

    if (!currentOrder) {
      await connection.rollback();
      await connection.release();
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // ── Stock Deduction Logic ──
    const isNowApproved = status === "verified" || status === "confirmed";
    const wasAlreadyApproved =
      currentOrder.status === "verified" ||
      currentOrder.status === "confirmed" ||
      currentOrder.status === "shipped" ||
      currentOrder.status === "delivered";

    // Deduct stock if transitioning into an approved state for the first time
    if (isNowApproved && !wasAlreadyApproved) {
      const [items] = await connection.query(
        "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
        [orderId],
      );
      for (const item of items) {
        await connection.query(
          "UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?",
          [item.quantity, item.product_id],
        );
      }
    }

    // ── Stock Restoration Logic (cancel/reject transition) ──
    const isNowCancelled = status === "cancelled" || status === "rejected";
    const wasActive = [
      "verified",
      "confirmed",
      "shipped",
      "out_for_delivery",
    ].includes(currentOrder.status);

    if (isNowCancelled && wasActive) {
      const [stockItems] = await connection.query(
        "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
        [orderId],
      );
      for (const item of stockItems) {
        await connection.query(
          "UPDATE products SET stock = stock + ? WHERE id = ?",
          [item.quantity, item.product_id],
        );
      }
    }

    // Update status and save the rejection reason if provided
    await connection.query(
      "UPDATE orders SET status = ?, rejection_reason = ? WHERE id = ?",
      [status, req.body.reason || null, orderId],
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message:
        status === "rejected"
          ? "Order has been successfully rejected"
          : `Order status updated to ${status}`,
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};
