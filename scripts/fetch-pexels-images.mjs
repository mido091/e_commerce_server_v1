/**
 * fetch-pexels-images.mjs
 *
 * A utility script that queries the Pexels API for verified product images
 * and outputs a ready-to-paste JS mapping for seed-fashion-catalog.js.
 *
 * Usage:
 *   set PEXELS_API_KEY=your_key_here
 *   node scripts/fetch-pexels-images.mjs
 *
 * Get a free API key at: https://www.pexels.com/api/
 */

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const API_KEY = process.env.PEXELS_API_KEY;
if (!API_KEY) {
  console.error("❌ Missing PEXELS_API_KEY in your .env file.");
  console.error("   Get a free key at https://www.pexels.com/api/");
  process.exit(1);
}

const HEADERS = { Authorization: API_KEY };

/**
 * Search Pexels and return the first `count` photo IDs for a given query.
 */
async function searchPexels(query, count = 3, orientation = "portrait") {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=${orientation}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Pexels API error ${res.status}: ${res.statusText}`);
  const data = await res.json();
  return data.photos.map((p) => p.id);
}

// ── Define every product + its per-color search query ─────────────────────────
const PRODUCT_SEARCHES = [
  // TAILORING
  {
    product: "Relaxed Linen Blazer",
    colors: [
      { key: "cream", query: "man cream linen blazer fashion" },
      { key: "navy", query: "man navy blue blazer fashion" },
    ],
  },
  {
    product: "Structured Wool Suit Jacket",
    colors: [
      { key: "charcoal", query: "man charcoal grey wool suit jacket" },
      { key: "camel", query: "man camel brown suit jacket fashion" },
    ],
  },
  {
    product: "Double-Breasted Overcoat",
    colors: [
      { key: "camel", query: "man camel overcoat double breasted fashion" },
      { key: "black", query: "man black overcoat fashion editorial" },
    ],
  },

  // SHIRTS & KNITWEAR
  {
    product: "Cotton Oxford Shirt",
    colors: [
      { key: "white", query: "man white oxford shirt fashion" },
      { key: "sky-blue", query: "man light blue dress shirt fashion" },
      { key: "sage", query: "man sage green shirt fashion" },
    ],
  },
  {
    product: "Fine Knit Polo",
    colors: [
      { key: "ivory", query: "man ivory polo shirt knit fashion" },
      { key: "navy", query: "man navy polo shirt fashion" },
      { key: "terracotta", query: "man terracotta rust polo shirt" },
    ],
  },
  {
    product: "Merino Crew-Neck Sweater",
    colors: [
      { key: "oatmeal", query: "man oatmeal beige crew neck sweater" },
      { key: "forest", query: "man forest green wool sweater fashion" },
      { key: "slate", query: "man slate grey crew neck sweater knit" },
    ],
  },

  // TROUSERS & DENIM
  {
    product: "Pleated Wide-Leg Trousers",
    colors: [
      { key: "sand", query: "man beige wide leg trousers fashion" },
      { key: "charcoal", query: "man charcoal grey wide leg trousers" },
    ],
  },
  {
    product: "Straight Selvedge Denim",
    colors: [
      { key: "indigo", query: "man indigo selvedge denim jeans fashion" },
      { key: "washed", query: "man light washed straight denim jeans" },
    ],
  },
  {
    product: "Cargo Utility Pants",
    colors: [
      { key: "olive", query: "man olive cargo pants utility fashion" },
      { key: "sand", query: "man sand beige cargo trousers fashion" },
    ],
  },

  // FOOTWEAR
  {
    product: "Minimal Leather Sneakers",
    colors: [
      { key: "white", query: "white leather sneakers minimal fashion" },
      { key: "black", query: "black leather minimal sneakers fashion" },
      { key: "bone", query: "off white bone leather sneakers fashion" },
    ],
  },
  {
    product: "Suede Desert Boots",
    colors: [
      { key: "desert-sand", query: "suede desert boots tan sand fashion" },
      { key: "mocha", query: "brown suede desert boots fashion" },
    ],
  },
  {
    product: "Flex Training Shoes",
    colors: [
      { key: "black-white", query: "black athletic training shoes fashion" },
      { key: "slate-grey", query: "grey athletic training shoes sport" },
    ],
  },

  // DRESSES & SETS
  {
    product: "Textured Midi Dress",
    colors: [
      { key: "sage", query: "woman sage green midi dress fashion" },
      { key: "sand", query: "woman sand beige midi dress fashion" },
      { key: "black", query: "woman black textured midi dress fashion" },
    ],
  },
  {
    product: "Satin Slip Dress",
    colors: [
      { key: "champagne", query: "woman champagne satin slip dress fashion" },
      { key: "midnight", query: "woman dark navy satin slip dress fashion" },
    ],
  },
  {
    product: "Fluid Co-Ord Set",
    colors: [
      { key: "clay", query: "woman clay terracotta matching co-ord set fashion" },
      { key: "ecru", query: "woman ecru cream two piece co-ord set fashion" },
    ],
  },

  // BAGS & ACCESSORIES
  {
    product: "Structured Leather Tote",
    colors: [
      { key: "tan", query: "tan leather structured tote bag fashion" },
      { key: "black", query: "black leather structured tote bag fashion" },
    ],
  },
  {
    product: "Canvas Messenger Bag",
    colors: [
      { key: "olive-canvas", query: "olive waxed canvas messenger bag fashion" },
      { key: "dark-brown", query: "dark brown canvas messenger bag fashion" },
    ],
  },
  {
    product: "Silk Print Scarf",
    colors: [
      { key: "botanical", query: "woman silk scarf green botanical accessories fashion" },
      { key: "marine", query: "woman silk scarf blue accessories fashion" },
      { key: "ivory", query: "woman ivory silk scarf accessories fashion" },
    ],
  },
  {
    product: "Casual Comfort Sandals",
    colors: [
      { key: "tan", query: "tan leather sandals summer fashion" },
      { key: "black", query: "black leather sandals summer fashion" },
    ],
  },
];

// ── Category image searches ────────────────────────────────────────────────────
const CATEGORY_SEARCHES = [
  { slug: "tailoring", query: "man smart tailored jacket fashion editorial" },
  { slug: "shirts-and-knitwear", query: "man dress shirt knitwear fashion editorial" },
  { slug: "trousers-and-denim", query: "man trousers denim fashion editorial" },
  { slug: "footwear", query: "leather sneakers shoes fashion editorial" },
  { slug: "dresses-and-sets", query: "woman elegant dress fashion editorial" },
  { slug: "bags-and-accessories", query: "leather bag accessories fashion editorial" },
];

// ── Main: query Pexels and print the mapping ──────────────────────────────────
async function main() {
  console.log("🔍 Querying Pexels API for verified product images…\n");

  // Products
  console.log("// ── PRODUCT IMAGE MAPPING ──────────────────────────────────");
  console.log("// Paste this into seed-fashion-catalog.js to replace all px() calls.\n");

  for (const item of PRODUCT_SEARCHES) {
    console.log(`// ${item.product}`);
    for (const color of item.colors) {
      try {
        const ids = await searchPexels(color.query, 3);
        const formatted = ids.map((id) => `px(${id})`).join(", ");
        console.log(`//   ${color.key}: [${formatted}]`);
        // Rate-limit: 1 request per 200ms
        await new Promise((r) => setTimeout(r, 250));
      } catch (err) {
        console.error(`//   ❌ ${color.key}: ${err.message}`);
      }
    }
    console.log();
  }

  // Categories
  console.log("\n// ── CATEGORY IMAGE MAPPING ─────────────────────────────────");
  for (const cat of CATEGORY_SEARCHES) {
    try {
      const [id] = await searchPexels(cat.query, 1, "landscape");
      console.log(`//   ${cat.slug}: px(${id})`);
      await new Promise((r) => setTimeout(r, 250));
    } catch (err) {
      console.error(`//   ❌ ${cat.slug}: ${err.message}`);
    }
  }

  console.log("\n✅ Done. Copy the output above into your seed file.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
