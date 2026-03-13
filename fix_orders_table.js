import db from "./config/db.js";

async function run() {
  try {
    console.log("Adding coupon_code to orders table...");
    await db.query("ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50) NULL AFTER total_price");
    console.log("✅ Success!");
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log("Column already exists.");
      process.exit(0);
    }
    console.error("Column add failed:", err);
    process.exit(1);
  }
}
run();
