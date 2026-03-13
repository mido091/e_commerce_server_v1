import db from "./config/db.js";

async function runMigration() {
  try {
    console.log("Adding brand asset columns to site_settings...");
    
    // Check if footer_logo_url exists
    const [footerLogoExists] = await db.query("SHOW COLUMNS FROM site_settings LIKE 'footer_logo_url'");
    if (footerLogoExists.length === 0) {
      console.log("Adding footer_logo_url column...");
      await db.query("ALTER TABLE site_settings ADD COLUMN footer_logo_url VARCHAR(255) DEFAULT ''");
    } else {
      console.log("footer_logo_url column already exists.");
    }

    // Check if favicon_url exists
    const [faviconExists] = await db.query("SHOW COLUMNS FROM site_settings LIKE 'favicon_url'");
    if (faviconExists.length === 0) {
      console.log("Adding favicon_url column...");
      await db.query("ALTER TABLE site_settings ADD COLUMN favicon_url VARCHAR(255) DEFAULT ''");
    } else {
      console.log("favicon_url column already exists.");
    }

    console.log("✅ Brand asset columns check/migration complete.");
  } catch (err) {
    console.error("❌ Error during migration:", err);
  } finally {
    process.exit(0);
  }
}

runMigration();
