import db from "../config/db.js";

async function alterOrdersTable() {
  try {
    console.log("Starting DB Alteration Phase 2...");

    // Add payment_method and update status enum
    await db.query(`
      ALTER TABLE orders 
      ADD COLUMN payment_method ENUM('wallet', 'cod') DEFAULT 'wallet' AFTER payment_status,
      MODIFY COLUMN status ENUM('pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled', 'problem') DEFAULT 'pending';
    `);

    console.log("✅ DB Altered Successfully");
  } catch (err) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("⚠️ Columns already exist, continuing...");

      // Still try to modify the status ENUM just in case
      try {
        await db.query(`
          ALTER TABLE orders 
          MODIFY COLUMN status ENUM('pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled', 'problem') DEFAULT 'pending';
        `);
        console.log("✅ Status ENUM updated successfully");
      } catch (e) {
        console.error("Error modifying status:", e);
      }
    } else {
      console.error(err);
    }
  } finally {
    process.exit(0);
  }
}

alterOrdersTable();
