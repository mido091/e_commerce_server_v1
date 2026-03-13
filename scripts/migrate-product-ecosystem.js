import db from "../config/db.js";

async function migrate() {
  try {
    console.log("🔄 Starting Product Ecosystem migration...\n");

    // 1. Add specs columns to products
    const specsCols = ["specs_en", "specs_ar"];
    for (const col of specsCols) {
      const [exists] = await db.query(
        `SHOW COLUMNS FROM products LIKE '${col}'`,
      );
      if (exists.length > 0) {
        console.log(`⚠️  Column ${col} already exists, skipping.`);
      } else {
        await db.query(
          `ALTER TABLE products ADD COLUMN ${col} TEXT DEFAULT NULL`,
        );
        console.log(`✅ Column ${col} added to products.`);
      }
    }

    // 2. Create reviews table
    await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        rating TINYINT NOT NULL,
        comment TEXT,
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_review (user_id, product_id)
      )
    `);
    console.log("✅ Reviews table created (or already exists).");

    // Verify
    const [cols] = await db.query("SHOW COLUMNS FROM products");
    console.log("\n📋 Products columns:", cols.map((c) => c.Field).join(", "));
    const [revCols] = await db.query("SHOW COLUMNS FROM reviews");
    console.log("📋 Reviews columns:", revCols.map((c) => c.Field).join(", "));

    console.log("\n🎉 Migration complete!");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    process.exit(0);
  }
}

migrate();
