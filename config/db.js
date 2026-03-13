import mysql from "mysql2";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// ── Connection pool ────────────────────────────────────────────────
// connectionLimit kept low (3) so we don't exhaust Aiven's free-tier
// connection quota while an old server process may still be running.
// Connections are created lazily on first query — no blocking startup test.
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // increased for seeding
  queueLimit: 0,
  connectTimeout: 30000, // 30 s to wait for Aiven to accept connection
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : null,
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
