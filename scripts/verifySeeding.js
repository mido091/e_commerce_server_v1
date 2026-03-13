import db from "../config/db.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function verify() {
  const connection = await db.getConnection();
  try {
    console.log("🕵️ Starting database audit...");
    
    // Check Categories
    const [cats] = await connection.query('SELECT name, image_url FROM categories');
    console.log(`\n📂 Categories found: ${cats.length}`);
    cats.forEach(c => {
      console.log(`   - ${c.name.padEnd(25)} : ${c.image_url ? '✅ Image OK' : '❌ MISSING IMAGE'}`);
    });

    // Check Products & Images
    const [imgs] = await connection.query('SELECT product_id, COUNT(*) as count FROM product_images GROUP BY product_id');
    const [totalProds] = await connection.query('SELECT COUNT(*) as count FROM products');
    
    console.log(`\n🛒 Total Products in DB: ${totalProds[0].count}`);
    console.log(`🖼️  Products with images: ${imgs.length}`);
    
    const totalImages = imgs.reduce((sum, row) => sum + row.count, 0);
    console.log(`📊 Total product images: ${totalImages}`);
    
    const productsUnderFour = imgs.filter(i => i.count < 4);
    if (productsUnderFour.length > 0) {
      console.log(`\n⚠️  Warning: ${productsUnderFour.length} products have fewer than 4 images.`);
    } else if (imgs.length === 60 && totalImages === 240) {
      console.log(`\n🌟 Perfect Score! All 60 products have 4 images each.`);
    }

    console.log("\n✅ Audit complete.");
  } catch (error) {
    console.error("❌ Audit failed:", error);
  } finally {
    connection.release();
    process.exit();
  }
}

verify();
