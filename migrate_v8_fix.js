import db from "./config/db.js";

async function runMigration() {
  try {
    console.log("Adding social columns to site_settings...");
    // MySQL 8+ supports IF NOT EXISTS on ALTER but older versions don't.
    // Try adding directly. If they exist, it throws ER_DUP_FIELDNAME.
    await db.query(`
      ALTER TABLE site_settings
      ADD COLUMN social_facebook VARCHAR(255) DEFAULT '',
      ADD COLUMN social_x VARCHAR(255) DEFAULT '',
      ADD COLUMN social_whatsapp VARCHAR(255) DEFAULT '',
      ADD COLUMN social_telegram VARCHAR(255) DEFAULT '',
      ADD COLUMN social_gmail VARCHAR(255) DEFAULT '';
    `);
    console.log("Columns added successfully.");
  } catch (err) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("Social columns already exist, skipping.");
    } else {
      console.error("Error adding columns:", err.message);
    }
  }

  process.exit(0);
}

runMigration();
