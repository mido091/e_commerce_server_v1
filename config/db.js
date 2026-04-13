import mysql from "mysql2";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// ── Connection pool ────────────────────────────────────────────────
const sslConfig = {
  rejectUnauthorized: true, // Always verify for TiDB Cloud
};

// If a CA cert path is provided in .env, try to load it
if (process.env.DB_ATTR_SSL_CA) {
  try {
    const caPath = path.resolve(__dirname, "..", process.env.DB_ATTR_SSL_CA);
    if (fs.existsSync(caPath)) {
      sslConfig.ca = fs.readFileSync(caPath);
    }
  } catch (err) {
    console.warn("⚠️ Failed to load SSL CA from:", process.env.DB_ATTR_SSL_CA, err.message);
  }
}

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000,
  ssl: sslConfig, // Always enable SSL for TiDB Cloud
});

// Lazy connection test — runs 2s after startup so it doesn't block
// the server or crash the process if connections are temporarily exhausted.
setTimeout(() => {
  db.getConnection((err, conn) => {
    if (err) {
      console.error("❌ DB connection failed:", err.code, "-", err.message);
    } else {
      console.log("✅ Database connected to:", process.env.DB_HOST);
      conn.release();
    }
  });
}, 2000);

export default db.promise();
