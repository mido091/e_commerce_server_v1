import db from "../config/db.js";

async function alterCheckoutSchema() {
  const connection = await db.getConnection();
  try {
    console.log("Starting DB Alteration Phase 3 (Advanced Checkout)...");

    // 1. Expand Enum
    await connection.query(
      "ALTER TABLE orders MODIFY COLUMN payment_method ENUM('wallet', 'cod', 'instapay') DEFAULT 'wallet';",
    );
    console.log("✅ payment_method ENUM expanded to include 'instapay'.");

    // 2. Add Shipping Phone
    await connection.query(
      "ALTER TABLE orders ADD COLUMN shipping_phone VARCHAR(20) NULL;",
    );
    console.log("✅ shipping_phone column added.");

    // 3. Add Shipping Address
    await connection.query(
      "ALTER TABLE orders ADD COLUMN shipping_address TEXT NULL;",
    );
    console.log("✅ shipping_address column added.");

    console.log("🎉 All DB schema mutations completed successfully!");
  } catch (error) {
    if (error.code === "ER_DUP_FIELDNAME") {
      console.log("⚠️ Columns already exist. Skipping.");
    } else {
      console.error("❌ DB Alteration Error:", error);
    }
  } finally {
    connection.release();
    process.exit(0);
  }
}

alterCheckoutSchema();
