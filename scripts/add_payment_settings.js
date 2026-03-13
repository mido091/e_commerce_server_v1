import db from "../config/db.js";

async function runMigration() {
  try {
    console.log("Checking if wallet_number and instapay_handle exist in site_settings...");
    
    // Check and add wallet_number
    try {
      await db.query("ALTER TABLE site_settings ADD COLUMN wallet_number VARCHAR(255) DEFAULT '';");
      console.log("Added wallet_number column.");
    } catch (err) {
      if (err.code === "ER_DUP_FIELDNAME") {
        console.log("wallet_number column already exists.");
      } else {
        throw err;
      }
    }

    // Check and add instapay_handle
    try {
      await db.query("ALTER TABLE site_settings ADD COLUMN instapay_handle VARCHAR(255) DEFAULT '';");
      console.log("Added instapay_handle column.");
    } catch (err) {
      if (err.code === "ER_DUP_FIELDNAME") {
        console.log("instapay_handle column already exists.");
      } else {
        throw err;
      }
    }

    // Initialize values if empty
    await db.query("UPDATE site_settings SET wallet_number = '01012345678' WHERE wallet_number = '' OR wallet_number IS NULL;");
    await db.query("UPDATE site_settings SET instapay_handle = 'store@instapay' WHERE instapay_handle = '' OR instapay_handle IS NULL;");
    
    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

runMigration();
