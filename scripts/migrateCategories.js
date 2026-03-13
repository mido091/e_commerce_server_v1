import db from "../config/db.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function migrate() {
  const connection = await db.getConnection();
  try {
    console.log("🛠️  Adding image_url column to categories table...");
    await connection.query("ALTER TABLE categories ADD COLUMN image_url VARCHAR(255) AFTER icon");
    console.log("✅ Column added successfully.");
  } catch (error) {
    if (error.code === 'ER_DUP_COLUMN_NAME') {
      console.log("ℹ️  Column image_url already exists.");
    } else {
      console.error("❌ Migration failed:", error);
    }
  } finally {
    connection.release();
    process.exit();
  }
}

migrate();
