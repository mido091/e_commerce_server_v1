import db from "../config/db.js";

async function migrate() {
  try {
    console.log("🔄 Starting Cascade Delete Migration...");

    // 1. Update fk_products_category
    console.log("Updating fk_products_category to ON DELETE CASCADE...");
    try {
      await db.query("ALTER TABLE products DROP FOREIGN KEY fk_products_category");
    } catch (e) {
      console.log("⚠️ Could not drop fk_products_category (might not exist with this name), skipping drop.");
    }
    await db.query(`
      ALTER TABLE products 
      ADD CONSTRAINT fk_products_category 
      FOREIGN KEY (category_id) 
      REFERENCES categories(id) 
      ON DELETE CASCADE
    `);

    // 2. Update product_images foreign key
    // We'll find the name dynamically or use the standard ibfk_1 if possible
    console.log("Updating product_images foreign key to ON DELETE CASCADE...");
    const [rows] = await db.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'product_images' 
      AND COLUMN_NAME = 'product_id'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    if (rows.length > 0) {
      const constraintName = rows[0].CONSTRAINT_NAME;
      await db.query(`ALTER TABLE product_images DROP FOREIGN KEY ${constraintName}`);
    }

    await db.query(`
      ALTER TABLE product_images 
      ADD CONSTRAINT fk_product_images_product 
      FOREIGN KEY (product_id) 
      REFERENCES products(id) 
      ON DELETE CASCADE
    `);

    console.log("✅ Migration Successful!");
  } catch (err) {
    console.error("❌ Migration Failed:", err.message);
  } finally {
    process.exit(0);
  }
}

migrate();
