import db from "../config/db.js";
import slugify from "slugify";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function test() {
  const connection = await db.getConnection();
  try {
    console.log("🚀 Testing category insert...");
    const cat = { id: 1, name: "Fashion & Apparel", name_ar: "الأزياء والملابس", icon: "shirt", image_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800" };
    const slug = slugify(cat.name, { lower: true, strict: true });
    
    console.log("   Attempting query...");
    const [result] = await connection.query(
      "INSERT INTO categories (id, name, name_ar, icon, image_url, slug) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), name_ar=VALUES(name_ar), icon=VALUES(icon), image_url=VALUES(image_url), slug=VALUES(slug)",
      [cat.id, cat.name, cat.name_ar, cat.icon, cat.image_url, slug]
    );
    console.log("   ✅ Success!", result);
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    connection.release();
    process.exit();
  }
}

test();
