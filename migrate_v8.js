import db from "./config/db.js";

async function runMigration() {
  try {
    console.log("Adding social columns to site_settings...");
    await db.query(`
      ALTER TABLE site_settings
      ADD COLUMN IF NOT EXISTS social_facebook VARCHAR(255) DEFAULT '',
      ADD COLUMN IF NOT EXISTS social_x VARCHAR(255) DEFAULT '',
      ADD COLUMN IF NOT EXISTS social_whatsapp VARCHAR(255) DEFAULT '',
      ADD COLUMN IF NOT EXISTS social_telegram VARCHAR(255) DEFAULT '',
      ADD COLUMN IF NOT EXISTS social_gmail VARCHAR(255) DEFAULT '';
    `);
    console.log("Columns added via ALTER TABLE.");
  } catch (err) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("Social columns already exist.");
    } else {
      console.error("Error adding columns:", err);
    }
  }

  try {
    console.log("Creating contact_messages table...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('unread', 'read', 'archived') DEFAULT 'unread',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("contact_messages table created.");
  } catch (err) {
    console.error("Error creating table:", err);
  }

  process.exit(0);
}

runMigration();
