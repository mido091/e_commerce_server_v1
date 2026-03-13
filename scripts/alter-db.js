import db from "../config/db.js";

async function alterDB() {
  try {
    console.log("Starting DB Alteration...");
    await db.query(`
      ALTER TABLE orders 
      MODIFY COLUMN payment_status ENUM('unpaid', 'pending_verification', 'paid', 'rejected') DEFAULT 'unpaid', 
      ADD COLUMN payment_receipt_url VARCHAR(255) DEFAULT NULL, 
      ADD COLUMN transaction_id VARCHAR(255) DEFAULT NULL, 
      ADD COLUMN rejection_reason TEXT DEFAULT NULL
    `);
    console.log("✅ DB Altered Successfully");
  } catch (err) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("⚠️ Columns already exist, continuing...");
    } else {
      console.error(err);
    }
  } finally {
    process.exit(0);
  }
}

alterDB();
