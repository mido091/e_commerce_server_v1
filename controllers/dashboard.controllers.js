import db from "../config/db.js";

function buildRangeClause(alias, startDate, endDate, params) {
  const conditions = [];
  if (startDate) {
    conditions.push(`${alias}.created_at >= ?`);
    params.push(startDate);
  }
  if (endDate) {
    conditions.push(`${alias}.created_at <= ?`);
    params.push(endDate);
  }
  return conditions.length ? conditions.join(" AND ") : "1=1";
}

const getDashboardStats = async (req, res, next) => {
  try {
    const startDate = req.query.start_date ? new Date(req.query.start_date) : null;
    const endDate = req.query.end_date ? new Date(req.query.end_date) : null;

    const orderParams = [];
    const orderWhere = buildRangeClause("o", startDate, endDate, orderParams);

    const productParams = [];
    const productWhere = buildRangeClause("p", startDate, endDate, productParams);

    const userParams = [];
    const userWhere = buildRangeClause("u", startDate, endDate, userParams);

    const [
      [[ordersStats]],
      [[revenueStats]],
      [[profitStats]],
      [[productsStats]],
      [[usersStats]],
      [recentOrders],
    ] = await Promise.all([
      db.query(
        `
          SELECT
            COUNT(*) AS total_orders,
            SUM(CASE WHEN o.status = 'returned' THEN 1 ELSE 0 END) AS total_returns,
            SUM(CASE WHEN o.payment_status = 'pending_verification' THEN 1 ELSE 0 END) AS pending_payments
          FROM orders o
          WHERE ${orderWhere}
        `,
        orderParams,
      ),
      db.query(
        `
          SELECT COALESCE(SUM(o.total_price), 0) AS delivered_revenue
          FROM orders o
          WHERE ${orderWhere} AND o.status IN ('delivered', 'completed')
        `,
        orderParams,
      ),
      db.query(
        `
          SELECT COALESCE(SUM(oi.quantity * COALESCE(p.net_profit, 0)), 0) AS delivered_net_profit
          FROM orders o
          INNER JOIN order_items oi ON oi.order_id = o.id
          INNER JOIN products p ON p.id = oi.product_id
          WHERE ${orderWhere} AND o.status IN ('delivered', 'completed')
        `,
        orderParams,
      ),
      db.query(
        `
          SELECT COUNT(*) AS total_products
          FROM products p
          WHERE ${productWhere}
        `,
        productParams,
      ),
      db.query(
        `
          SELECT COUNT(*) AS total_users
          FROM users u
          WHERE ${userWhere}
        `,
        userParams,
      ),
      db.query(
        `
          SELECT
            o.id,
            o.status,
            o.payment_status,
            o.total_price,
            o.created_at,
            u.name,
            u.email
          FROM orders o
          LEFT JOIN users u ON u.id = o.user_id
          WHERE ${orderWhere}
          ORDER BY o.created_at DESC
          LIMIT 8
        `,
        orderParams,
      ),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total_orders: Number(ordersStats.total_orders || 0),
        delivered_revenue: Number(revenueStats.delivered_revenue || 0),
        delivered_net_profit: Number(profitStats.delivered_net_profit || 0),
        total_returns: Number(ordersStats.total_returns || 0),
        pending_payments: Number(ordersStats.pending_payments || 0),
        total_products: Number(productsStats.total_products || 0),
        total_users: Number(usersStats.total_users || 0),
        recent_orders: recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { getDashboardStats };
