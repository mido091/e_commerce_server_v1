import db from "../config/db.js";

async function cleanOrders() {
  const connection = await db.getConnection();
  try {
    console.log("Starting DB Cleanup for Orders and Payments...");

    // Disable foreign key checks to allow free deletion without constraint errors
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");

    // Clear order items
    console.log("1. Emptying `order_items` table...");
    await connection.query("TRUNCATE TABLE order_items");

    // Clear orders
    console.log("2. Emptying `orders` table...");
    await connection.query("TRUNCATE TABLE orders");

    // (Optional) Clear completely orphan payments/reviews if they are separate
    // We already truncated orders which is the main transactional hub.

    // Re-enable foreign key checks
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("✅ Cleanup Complete! Orders and Order Items erased.");
    console.log(
      "✅ AUTO_INCREMENT reset to 1. Your next order will be Order #1.",
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Cleanup Failed:", error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

cleanOrders();
