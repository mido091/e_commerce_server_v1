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
    console.log("🕵️ Checking process list...");
    const [rows] = await connection.query("SHOW PROCESSLIST");
    console.table(rows);
    
    console.log("\n🕵️ Checking for locked tables...");
    const [locks] = await connection.query("SHOW OPEN TABLES WHERE In_use > 0");
    console.table(locks);
  } catch (error) {
    console.error("❌ check failed:", error);
  } finally {
    connection.release();
    process.exit();
  }
}

check();
