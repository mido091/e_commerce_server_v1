import db from "../config/db.js";

async function alterDB() {
  const conn = await db.getConnection();
  try {
    await conn.query(
      "ALTER TABLE orders MODIFY COLUMN status ENUM('pending','confirmed','verified','out_for_delivery','shipped','delivered','cancelled','rejected','problem') DEFAULT 'pending'",
    );
    console.log(
      "✅ DB Altered Successfully: status ENUM expanded to include verified, rejected, and shipped.",
    );
  } catch (e) {
    console.error("DB Error:", e);
  } finally {
    conn.release();
    process.exit(0);
  }
}

alterDB();
