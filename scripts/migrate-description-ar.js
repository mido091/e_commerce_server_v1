import db from "../config/db.js";

async function migrateDescriptionAr() {
  try {
    console.log("🔄 Adding description_ar column to products table...");

    // Check if column already exists
    const [columns] = await db.query(
      "SHOW COLUMNS FROM products LIKE 'description_ar'",
    );

    if (columns.length > 0) {
      console.log("⚠️  Column description_ar already exists, skipping.");
    } else {
      await db.query(`
        ALTER TABLE products 
        ADD COLUMN description_ar TEXT DEFAULT NULL AFTER description
      `);
      console.log("✅ Column description_ar added successfully.");
    }

    // Verify the schema
    const [allCols] = await db.query("SHOW COLUMNS FROM products");
    console.log(
      "\n📋 Current products columns:",
      allCols.map((c) => c.Field).join(", "),
    );
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    process.exit(0);
  }
}

migrateDescriptionAr();
