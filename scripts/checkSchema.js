import db from "../config/db.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function check() {
  const connection = await db.getConnection();
  try {
    const [cols] = await connection.query('SHOW COLUMNS FROM categories');
    console.log(JSON.stringify(cols, null, 2));
  } catch (error) {
    console.error("❌ Schema check failed:", error);
  } finally {
    connection.release();
    process.exit();
  }
}

check();
