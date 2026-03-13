import db from "../config/db.js";

async function migrate() {
  try {
    console.log("🔄 Updating categories schema...");
    const [rows] = await db.query("SHOW COLUMNS FROM categories LIKE 'image_url'");
    if (rows.length === 0) {
      console.log("Adding 'image_url' column to categories...");
      await db.query("ALTER TABLE categories ADD COLUMN image_url VARCHAR(500) AFTER icon");
      console.log("✅ Column added successfully!");
    } else {
      console.log("✨ 'image_url' column already exists.");
    }
  } catch (err) {
    console.error("❌ Migration Failed:", err.message);
  } finally {
    process.exit(0);
  }
}

migrate();
