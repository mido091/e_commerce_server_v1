/**
 * seed-fashion-catalog.js  — v3 "Per-Color Images"
 *
 * Key behaviour
 * ─────────────
 * • Category images  → 1 landscape photo per category (Pexels API search)
 * • Product images   → each COLOR has its OWN search query that includes the
 *   color name (e.g. "man navy blue linen blazer fashion editorial").
 *   This means clicking a color swatch triggers a gallery switch to photos
 *   showing that exact color of the product.
 * • Requires PEXELS_API_KEY in .env  (free key at https://www.pexels.com/api/)
 */

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import slugify from "slugify";
import db from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// ── Pexels helper ─────────────────────────────────────────────────────────────
const PEXELS_KEY = process.env.PEXELS_API_KEY;
if (!PEXELS_KEY) {
  console.error("❌  PEXELS_API_KEY missing from .env — get a free key at https://www.pexels.com/api/");
  process.exit(1);
}

const imgCache = new Map();

async function pexelsSearch(query, count = 3, orientation = "portrait") {
  const key = `${query}::${count}::${orientation}`;
  if (imgCache.has(key)) return imgCache.get(key);

  const url =
    `https://api.pexels.com/v1/search` +
    `?query=${encodeURIComponent(query)}&per_page=${count}&orientation=${orientation}&size=large`;

  const res = await fetch(url, { headers: { Authorization: PEXELS_KEY } });
  if (!res.ok) {
    console.warn(`  ⚠  Pexels ${res.status} for "${query}" — using placeholder`);
    return ["https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=1200"];
  }

  const data = await res.json();
  const urls = (data.photos || []).map((p) => p.src.large2x || p.src.large);
  while (urls.length < count && urls.length > 0) urls.push(urls[0]);

  imgCache.set(key, urls);
  await new Promise((r) => setTimeout(r, 300)); // respect rate limit
  return urls;
}

// ── Categories ────────────────────────────────────────────────────────────────
const categories = [
  { slug: "tailoring",          name: "Tailoring",          name_ar: "التفصيل الراقي",       icon: "shirt",   imageQuery: "man tailored blazer fashion editorial" },
  { slug: "shirts-and-knitwear",name: "Shirts & Knitwear",  name_ar: "القمصان والتريكو",     icon: "shirt",   imageQuery: "man dress shirt knitwear fashion editorial" },
  { slug: "trousers-and-denim", name: "Trousers & Denim",   name_ar: "البناطيل والدنيم",     icon: "package", imageQuery: "man trousers denim fashion editorial" },
  { slug: "footwear",           name: "Footwear",           name_ar: "الأحذية",              icon: "package", imageQuery: "fashion sneakers shoes editorial minimal" },
  { slug: "dresses-and-sets",   name: "Dresses & Sets",     name_ar: "الفساتين والأطقم",     icon: "shirt",   imageQuery: "woman elegant midi dress fashion editorial" },
  { slug: "bags-and-accessories",name:"Bags & Accessories",  name_ar: "الحقائب والإكسسوارات", icon: "package", imageQuery: "leather bag fashion accessories editorial" },
];

// ── Products ──────────────────────────────────────────────────────────────────
// Each color has its own `imageQuery` — Pexels returns photos specific to that
// color, so the gallery switches when the user clicks a different swatch.
const products = [

  // ── TAILORING ───────────────────────────────────────────────────────────────
  {
    category: "tailoring",
    name: "Relaxed Linen Blazer", name_ar: "بليزر كتان مريح",
    description:    "A lightweight linen blazer with an easy, unstructured silhouette. Designed for warm days and polished casual looks.",
    description_ar: "بليزر كتان خفيف الوزن ببنية مرنة. مصمم للأيام الدافئة والإطلالات الكاجوال الراقية.",
    specs_en: "Fabric: 100% linen\nFit: relaxed, unstructured\nDetails: notch lapel, two-button closure\nCare: dry clean or hand wash cold",
    specs_ar: "الخامة: كتان 100%\nالقصة: مريحة وغير مقيدة\nالتفاصيل: ياقة نوتش، إغلاق بزرين\nالعناية: تنظيف جاف أو غسيل يدوي بالبارد",
    price: 1650, old_price: 1950, net_profit: 380,
    size_mode: "alpha", size_options: ["XS","S","M","L","XL"],
    colors: [
      { key:"cream",  name:"Cream",  name_ar:"كريمي",  value:"#F5F0E6", imageQuery:"man cream beige linen blazer fashion editorial",     stock:{XS:2,S:4,M:5,L:4,XL:2} },
      { key:"navy",   name:"Navy",   name_ar:"نيفي",   value:"#1B2A4A", imageQuery:"man navy blue linen blazer fashion editorial",        stock:{XS:1,S:3,M:4,L:3,XL:1} },
      { key:"sand",   name:"Sand",   name_ar:"رملي",   value:"#C9A96E", imageQuery:"man sand khaki linen blazer fashion editorial",       stock:{XS:1,S:2,M:3,L:2,XL:1} },
    ],
  },
  {
    category: "tailoring",
    name: "Structured Wool Suit Jacket", name_ar: "جاكيت بدلة صوف بهيكل",
    description:    "A precisely tailored wool suit jacket with a clean shoulder line. Built for occasions that reward a well-fitted jacket.",
    description_ar: "جاكيت بدلة صوف مُفصَّل بدقة بخط كتف نظيف. مصمم للمناسبات التي تستوجب أكمل ما عندك.",
    specs_en: "Fabric: wool blend\nFit: slim tailored\nDetails: single-breasted, flap pockets\nCare: dry clean only",
    specs_ar: "الخامة: مزيج صوف\nالقصة: ضيقة مفصلة\nالتفاصيل: صدر واحد، جيوب بغطاء\nالعناية: تنظيف جاف فقط",
    price: 3200, old_price: 3750, net_profit: 700,
    size_mode: "alpha", size_options: ["S","M","L","XL"],
    colors: [
      { key:"charcoal", name:"Charcoal", name_ar:"فحمي",  value:"#3A3A3A", imageQuery:"man charcoal grey wool suit jacket fashion editorial", stock:{S:2,M:4,L:4,XL:2} },
      { key:"camel",    name:"Camel",    name_ar:"كاميل", value:"#C19A6B", imageQuery:"man camel beige wool suit jacket fashion editorial",    stock:{S:1,M:3,L:3,XL:1} },
      { key:"navy",     name:"Navy",     name_ar:"نيفي",  value:"#1B2A4A", imageQuery:"man navy blue wool suit jacket fashion editorial",       stock:{S:1,M:2,L:2,XL:1} },
    ],
  },
  {
    category: "tailoring",
    name: "Double-Breasted Overcoat", name_ar: "معطف دبل بريستيد",
    description:    "A full-length double-breasted overcoat with wide lapels. A statement piece that anchors any winter outfit.",
    description_ar: "معطف طويل دبل بريستيد بياقات عريضة. قطعة محورية تمنح أي إطلالة شتوية هيبة لافتة.",
    specs_en: "Fabric: wool-cashmere blend\nFit: relaxed structured\nDetails: wide lapels, six-button closure\nCare: dry clean only",
    specs_ar: "الخامة: مزيج صوف وكشمير\nالقصة: هيكلية مريحة\nالتفاصيل: ياقات عريضة، إغلاق بستة أزرار\nالعناية: تنظيف جاف فقط",
    price: 4200, old_price: 4900, net_profit: 900,
    size_mode: "alpha", size_options: ["S","M","L","XL"],
    colors: [
      { key:"camel", name:"Camel", name_ar:"كاميل", value:"#C19A6B", imageQuery:"man camel double breasted overcoat fashion editorial",  stock:{S:2,M:3,L:3,XL:1} },
      { key:"black", name:"Black", name_ar:"أسود",  value:"#111111", imageQuery:"man black double breasted overcoat fashion editorial",  stock:{S:2,M:3,L:3,XL:1} },
    ],
  },

  // ── SHIRTS & KNITWEAR ────────────────────────────────────────────────────────
  {
    category: "shirts-and-knitwear",
    name: "Cotton Oxford Shirt", name_ar: "قميص أوكسفورد قطن",
    description:    "A classic cotton Oxford shirt with a medium-spread collar. The foundation of a considered wardrobe.",
    description_ar: "قميص أوكسفورد قطني كلاسيكي. أساس الخزانة المدروسة.",
    specs_en: "Fabric: 100% cotton Oxford weave\nFit: relaxed\nDetails: button-down collar, single chest pocket\nCare: machine wash warm",
    specs_ar: "الخامة: قطن 100% منسوج أوكسفورد\nالقصة: مريحة\nالتفاصيل: ياقة زرارية، جيب صدر واحد\nالعناية: غسيل آلة بالدافئ",
    price: 690, old_price: 820, net_profit: 150,
    size_mode: "alpha", size_options: ["XS","S","M","L","XL","XXL"],
    colors: [
      { key:"white",    name:"White",    name_ar:"أبيض",   value:"#F8F8F6", imageQuery:"man white oxford dress shirt fashion editorial",          stock:{XS:3,S:5,M:6,L:5,XL:3,XXL:2} },
      { key:"sky-blue", name:"Sky Blue", name_ar:"سماوي",  value:"#87CEEB", imageQuery:"man light blue sky oxford dress shirt fashion editorial",   stock:{XS:2,S:4,M:5,L:4,XL:3,XXL:2} },
      { key:"sage",     name:"Sage",     name_ar:"مريمية", value:"#8FAD7E", imageQuery:"man sage green oxford shirt fashion editorial",             stock:{XS:2,S:3,M:4,L:3,XL:2,XXL:1} },
    ],
  },
  {
    category: "shirts-and-knitwear",
    name: "Fine Knit Polo", name_ar: "بولو تريكو ناعم",
    description:    "A fine knit polo in a lightweight yarn — sits between a t-shirt and a formal shirt. Ribbed collar and cuffs.",
    description_ar: "بولو تريكو ناعم بخامة خفيفة — بين التيشيرت والقميص الرسمي.",
    specs_en: "Fabric: fine cotton-viscose knit\nFit: slim\nDetails: 3-button placket, ribbed collar/cuffs\nCare: machine wash cold",
    specs_ar: "الخامة: تريكو قطن وفيسكوز ناعم\nالقصة: ضيقة\nالتفاصيل: بلاكيت بثلاثة أزرار، ياقة وأساور ضلعية\nالعناية: غسيل آلة بالبارد",
    price: 840, old_price: 990, net_profit: 190,
    size_mode: "alpha", size_options: ["XS","S","M","L","XL"],
    colors: [
      { key:"ivory",      name:"Ivory",      name_ar:"عاجي",     value:"#EDE8DC", imageQuery:"man ivory cream knit polo shirt fashion editorial",      stock:{XS:2,S:4,M:5,L:4,XL:1} },
      { key:"navy",       name:"Navy",       name_ar:"نيفي",     value:"#1B2A4A", imageQuery:"man navy blue polo shirt fashion editorial",              stock:{XS:2,S:4,M:5,L:4,XL:1} },
      { key:"terracotta", name:"Terracotta", name_ar:"ترا كوتا", value:"#C4622D", imageQuery:"man terracotta rust orange polo shirt fashion editorial", stock:{XS:2,S:3,M:4,L:3,XL:1} },
    ],
  },
  {
    category: "shirts-and-knitwear",
    name: "Merino Crew-Neck Sweater", name_ar: "سويتر مرينو بياقة مستديرة",
    description:    "A mid-weight merino wool sweater with a classic crew neck. Soft, temperature-regulating, refined enough to layer.",
    description_ar: "سويتر صوف مرينو بياقة مستديرة كلاسيكية. ناعم وينظم درجة الحرارة.",
    specs_en: "Fabric: 100% superfine merino wool\nFit: regular\nDetails: crew neck, ribbed hem/cuffs/collar\nCare: hand wash cold",
    specs_ar: "الخامة: صوف مرينو فائق النعومة 100%\nالقصة: عادية\nالتفاصيل: ياقة مستديرة، حاشية وأكمام ضلعية\nالعناية: غسيل يدوي بالبارد",
    price: 1150, old_price: 1340, net_profit: 260,
    size_mode: "alpha", size_options: ["XS","S","M","L","XL"],
    colors: [
      { key:"oatmeal", name:"Oatmeal", name_ar:"شوفان",      value:"#D9CAAB", imageQuery:"man oatmeal beige crew neck merino wool sweater fashion editorial",  stock:{XS:2,S:4,M:5,L:4,XL:2} },
      { key:"forest",  name:"Forest",  name_ar:"أخضر غابة",  value:"#2D4A2D", imageQuery:"man forest dark green wool crew neck sweater fashion editorial",     stock:{XS:1,S:3,M:4,L:3,XL:1} },
      { key:"slate",   name:"Slate",   name_ar:"أردوازي",     value:"#708090", imageQuery:"man slate grey crew neck knit wool sweater fashion editorial",       stock:{XS:1,S:3,M:4,L:3,XL:1} },
    ],
  },

  // ── TROUSERS & DENIM ─────────────────────────────────────────────────────────
  {
    category: "trousers-and-denim",
    name: "Pleated Wide-Leg Trousers", name_ar: "بنطال واسع بطيات أمامية",
    description:    "High-waisted wide-leg trousers with forward pleats. A relaxed silhouette that reads polished.",
    description_ar: "بنطال واسع الساق بخصر عالٍ وطيات أمامية. سيلويت مريح يبدو أنيقاً.",
    specs_en: "Fabric: viscose-linen blend\nFit: high-waisted, wide leg\nDetails: forward pleats, side pockets\nCare: dry clean or hand wash cold",
    specs_ar: "الخامة: مزيج فيسكوز وكتان\nالقصة: خصر عالٍ، ساق واسعة\nالتفاصيل: طيات أمامية، جيوب جانبية\nالعناية: تنظيف جاف أو غسيل يدوي بالبارد",
    price: 970, old_price: 1140, net_profit: 220,
    size_mode: "numeric", size_options: ["30","32","34","36","38"],
    colors: [
      { key:"sand",     name:"Sand",     name_ar:"رملي", value:"#C9A96E", imageQuery:"man sand beige wide leg pleated trousers fashion editorial",    stock:{"30":2,"32":4,"34":5,"36":4,"38":2} },
      { key:"charcoal", name:"Charcoal", name_ar:"فحمي", value:"#3A3A3A", imageQuery:"man charcoal grey wide leg pleated trousers fashion editorial", stock:{"30":2,"32":4,"34":5,"36":3,"38":1} },
    ],
  },
  {
    category: "trousers-and-denim",
    name: "Straight Selvedge Denim", name_ar: "جينز مستقيم كلاسيكي",
    description:    "A straight-cut selvedge denim with mid-rise and clean finish. Gets better with every wash.",
    description_ar: "جينز سيلفيدج مستقيم القصة بارتفاع متوسط. يتحسن مع كل غسلة.",
    specs_en: "Fabric: 13oz selvedge denim (cotton)\nFit: straight, mid-rise\nDetails: 5-pocket construction\nCare: wash inside out, cold",
    specs_ar: "الخامة: دنيم سيلفيدج 13 أوقية (قطن)\nالقصة: مستقيمة، ارتفاع متوسط\nالتفاصيل: بناء 5 جيوب\nالعناية: اغسل مقلوباً بالبارد",
    price: 1120, old_price: 1340, net_profit: 250,
    size_mode: "numeric", size_options: ["30","32","34","36","38"],
    colors: [
      { key:"indigo", name:"Indigo",      name_ar:"نيلي",  value:"#3B4D7A", imageQuery:"man dark indigo selvedge denim straight jeans fashion editorial",  stock:{"30":3,"32":6,"34":8,"36":6,"38":3} },
      { key:"washed", name:"Washed Blue", name_ar:"مغسول", value:"#7B9DB5", imageQuery:"man light washed blue straight denim jeans fashion editorial",      stock:{"30":3,"32":5,"34":7,"36":5,"38":2} },
    ],
  },
  {
    category: "trousers-and-denim",
    name: "Cargo Utility Pants", name_ar: "بنطال كارجو يوتيليتي",
    description:    "Relaxed cargo trousers with functional pockets and a tapered leg. Built for everyday movement.",
    description_ar: "بنطال كارجو مريح بجيوب عملية وساق مستدقة. مصمم للحركة اليومية.",
    specs_en: "Fabric: cotton twill\nFit: relaxed tapered\nDetails: cargo pockets, elasticated waistband\nCare: machine wash cold",
    specs_ar: "الخامة: قطن تويل\nالقصة: مريحة مستدقة\nالتفاصيل: جيوب كارجو، خصر مطاطي\nالعناية: غسيل آلة بالبارد",
    price: 880, old_price: 1050, net_profit: 200,
    size_mode: "numeric", size_options: ["30","32","34","36","38"],
    colors: [
      { key:"olive", name:"Olive", name_ar:"زيتي", value:"#6B7055", imageQuery:"man olive green cargo pants utility fashion editorial",   stock:{"30":3,"32":5,"34":6,"36":4,"38":2} },
      { key:"sand",  name:"Sand",  name_ar:"رملي", value:"#C4AA84", imageQuery:"man sand beige cargo utility trousers fashion editorial", stock:{"30":2,"32":4,"34":5,"36":3,"38":1} },
    ],
  },

  // ── FOOTWEAR ─────────────────────────────────────────────────────────────────
  {
    category: "footwear",
    name: "Minimal Leather Sneakers", name_ar: "سنيكرز جلد مينيمال",
    description:    "Low-profile leather sneakers with a clean upper. Pairs with everything — daily wear without visual noise.",
    description_ar: "سنيكرز جلد بمنصة منخفضة وتصميم هادئ. للاستخدام اليومي دون مبالغة.",
    specs_en: "Upper: smooth full-grain leather\nSole: cushioned rubber\nDetails: tonal laces, padded collar\nFit: true to size",
    specs_ar: "الجزء العلوي: جلد ناعم طبيعي\nالنعل: مطاط مبطن\nالمقاس: يتوافق مع المقاس المعتاد",
    price: 2050, old_price: 2390, net_profit: 430,
    size_mode: "numeric", size_options: ["40","41","42","43","44","45"],
    colors: [
      { key:"white", name:"White", name_ar:"أبيض", value:"#F5F1E8", imageQuery:"white minimal leather sneakers fashion editorial product photography", stock:{"40":3,"41":5,"42":6,"43":5,"44":4,"45":2} },
      { key:"black", name:"Black", name_ar:"أسود", value:"#1A1A1A", imageQuery:"black minimal leather sneakers fashion editorial product photography", stock:{"40":3,"41":5,"42":6,"43":5,"44":4,"45":2} },
      { key:"bone",  name:"Bone",  name_ar:"عاجي", value:"#E8E0D1", imageQuery:"off white bone cream leather sneakers fashion editorial product",      stock:{"40":2,"41":4,"42":5,"43":4,"44":3,"45":1} },
    ],
  },
  {
    category: "footwear",
    name: "Suede Desert Boots", name_ar: "بوت سويد ديزرت",
    description:    "Soft suede desert boots with an ankle cut and natural crepe sole. Gets better with wear.",
    description_ar: "بوت سويد برقبة قصيرة ونعل كريب. يتحسن مع الاستخدام.",
    specs_en: "Upper: suede leather\nSole: natural crepe\nDetails: ankle height, two-eyelet closure\nFit: half size up recommended",
    specs_ar: "الجزء العلوي: جلد سويد\nالنعل: كريب طبيعي\nالمقاس: يُنصح بمقاس أكبر بنصف",
    price: 2260, old_price: 2620, net_profit: 470,
    size_mode: "numeric", size_options: ["40","41","42","43","44","45"],
    colors: [
      { key:"tan",   name:"Tan",   name_ar:"عسلي", value:"#C9A66B", imageQuery:"tan sand suede desert boots fashion editorial product photography",  stock:{"40":2,"41":4,"42":5,"43":5,"44":3,"45":1} },
      { key:"mocha", name:"Mocha", name_ar:"موكا", value:"#6F4E37", imageQuery:"brown mocha dark suede desert boots fashion editorial product photography", stock:{"40":2,"41":3,"42":4,"43":4,"44":2,"45":1} },
    ],
  },
  {
    category: "footwear",
    name: "Flex Training Shoes", name_ar: "حذاء تدريب فليكس",
    description:    "Lightweight training shoes with breathable mesh. Built for gym sessions — looks sharp enough to wear out.",
    description_ar: "حذاء تدريب خفيف بشبك تنفسي. مصمم لجلسات الجيم واليوم النشط.",
    specs_en: "Upper: engineered mesh\nSole: flexible rubber\nDetails: cushioned insole, lace-up\nFit: true to size",
    specs_ar: "الجزء العلوي: شبك هندسي\nالنعل: مطاط مرن\nالمقاس: يتوافق مع المقاس المعتاد",
    price: 1670, old_price: 1900, net_profit: 350,
    size_mode: "numeric", size_options: ["40","41","42","43","44","45"],
    colors: [
      { key:"black-white", name:"Black / White",  name_ar:"أسود وأبيض",     value:"#1A1A1A", imageQuery:"black white athletic training running shoes sport editorial",  stock:{"40":4,"41":6,"42":7,"43":6,"44":4,"45":2} },
      { key:"grey",        name:"Slate Grey",      name_ar:"رمادي أردوازي",  value:"#6B7280", imageQuery:"grey slate athletic training running shoes sport editorial",    stock:{"40":3,"41":5,"42":6,"43":5,"44":3,"45":2} },
    ],
  },

  // ── DRESSES & SETS ───────────────────────────────────────────────────────────
  {
    category: "dresses-and-sets",
    name: "Textured Midi Dress", name_ar: "فستان ميدي بنسيج خفيف",
    description:    "A softly textured midi dress with a fluid line. Elegant without the effort.",
    description_ar: "فستان ميدي بنسيج ناعم وخط انسيابي. أنيق دون تكلف.",
    specs_en: "Fabric: textured viscose blend\nFit: easy relaxed\nDetails: clean scoop neckline, midi length\nCare: hand wash cold",
    specs_ar: "الخامة: مزيج فيسكوز بنسيج خفيف\nالقصة: مريحة سهلة\nالعناية: غسيل يدوي بالبارد",
    price: 1680, old_price: 1940, net_profit: 360,
    size_mode: "alpha", size_options: ["XS","S","M","L","XL"],
    colors: [
      { key:"sage",  name:"Sage",  name_ar:"مريمية", value:"#8FAD7E", imageQuery:"woman sage green textured midi dress fashion editorial elegant", stock:{XS:2,S:4,M:5,L:4,XL:2} },
      { key:"sand",  name:"Sand",  name_ar:"رملي",   value:"#D4B896", imageQuery:"woman sand beige textured midi dress fashion editorial elegant", stock:{XS:2,S:3,M:5,L:4,XL:2} },
      { key:"black", name:"Black", name_ar:"أسود",   value:"#111827", imageQuery:"woman black textured midi dress fashion editorial elegant",      stock:{XS:2,S:4,M:5,L:4,XL:2} },
    ],
  },
  {
    category: "dresses-and-sets",
    name: "Satin Slip Dress", name_ar: "فستان سليب ساتان",
    description:    "A bias-cut satin slip dress with a cowl neckline. For evenings or layered for daytime.",
    description_ar: "فستان ساتان مقصوص بزاوية مع رقبة كاول. للمساء أو مع طبقة داخلية للنهار.",
    specs_en: "Fabric: satin (polyester blend)\nFit: slim bias cut\nDetails: cowl neckline, adjustable straps\nCare: hand wash or dry clean",
    specs_ar: "الخامة: ساتان (مزيج بوليستر)\nالقصة: ضيقة مقصوصة\nالعناية: غسيل يدوي أو تنظيف جاف",
    price: 1420, old_price: 1680, net_profit: 310,
    size_mode: "alpha", size_options: ["XS","S","M","L","XL"],
    colors: [
      { key:"champagne", name:"Champagne", name_ar:"شامبانيا", value:"#E8D5B7", imageQuery:"woman champagne gold satin slip dress fashion editorial elegant", stock:{XS:2,S:3,M:4,L:3,XL:1} },
      { key:"midnight",  name:"Midnight",  name_ar:"ليلي",     value:"#1F2937", imageQuery:"woman midnight dark navy satin slip dress fashion editorial",    stock:{XS:2,S:4,M:4,L:3,XL:2} },
    ],
  },
  {
    category: "dresses-and-sets",
    name: "Fluid Co-Ord Set", name_ar: "طقم انسيابي قطعتين",
    description:    "A coordinated two-piece set: relaxed top and straight trousers. All-day ease in one outfit.",
    description_ar: "طقم من قطعتين بتوب مريح وبنطال مستقيم. حرية طوال اليوم في إطلالة واحدة.",
    specs_en: "Fabric: matte crepe blend\nFit: relaxed coordinated\nDetails: loose-fit top, straight trousers\nCare: machine wash gentle cold",
    specs_ar: "الخامة: كريب مطفي\nالقصة: مريحة متناسقة\nالعناية: غسيل آلة لطيف بالبارد",
    price: 2140, old_price: 2480, net_profit: 480,
    size_mode: "alpha", size_options: ["XS","S","M","L","XL"],
    colors: [
      { key:"clay", name:"Clay", name_ar:"طيني",  value:"#B08968", imageQuery:"woman clay terracotta matching co-ord two piece set fashion editorial", stock:{XS:2,S:3,M:4,L:4,XL:2} },
      { key:"ecru", name:"Ecru", name_ar:"إيكرو", value:"#EDE8DC", imageQuery:"woman ecru cream ivory two piece co-ord set fashion editorial",         stock:{XS:2,S:3,M:4,L:3,XL:2} },
    ],
  },

  // ── BAGS & ACCESSORIES ───────────────────────────────────────────────────────
  {
    category: "bags-and-accessories",
    name: "Structured Leather Tote", name_ar: "حقيبة توت جلد بهيكل منظم",
    description:    "A structured leather tote for daily essentials. Clean lines for work and travel.",
    description_ar: "حقيبة توت جلد بهيكل منظم للأغراض اليومية. خطوط نظيفة للعمل والسفر.",
    specs_en: "Material: full-grain leather\nSize: 35 × 28 × 12 cm\nDetails: magnetic closure, zip pocket, dual handles\nCare: leather conditioner recommended",
    specs_ar: "الخامة: جلد طبيعي كامل\nالمقاس: 35 × 28 × 12 سم\nالعناية: يُنصح باستخدام مرطب الجلد",
    price: 1980, old_price: 2290, net_profit: 420,
    size_mode: "none", size_options: [],
    colors: [
      { key:"tan",   name:"Tan",   name_ar:"عسلي", value:"#B08968", imageQuery:"tan brown structured leather tote bag fashion editorial product photography", stock:8 },
      { key:"black", name:"Black", name_ar:"أسود", value:"#111827", imageQuery:"black structured leather tote bag fashion editorial product photography",     stock:7 },
    ],
  },
  {
    category: "bags-and-accessories",
    name: "Canvas Messenger Bag", name_ar: "حقيبة ماسنجر كانفاس",
    description:    "A waxed canvas messenger bag with structured base. Fits a 13-inch laptop.",
    description_ar: "حقيبة ماسنجر كانفاس مشمعة. تتسع لجهاز 13 بوصة.",
    specs_en: "Material: waxed canvas + leather trim\nSize: 40 × 30 × 12 cm\nDetails: main flap, front pocket, laptop sleeve\nCare: wipe clean",
    specs_ar: "الخامة: كانفاس مشمع + تشطيب جلد\nالمقاس: 40 × 30 × 12 سم\nالعناية: تنظيف بقطعة قماش رطبة",
    price: 1450, old_price: 1720, net_profit: 310,
    size_mode: "none", size_options: [],
    colors: [
      { key:"olive",      name:"Olive Canvas", name_ar:"كانفاس زيتي", value:"#6B7055", imageQuery:"olive green waxed canvas messenger bag fashion editorial product photography", stock:6 },
      { key:"dark-brown", name:"Dark Brown",   name_ar:"بني داكن",    value:"#4A2E1F", imageQuery:"dark brown canvas leather messenger bag fashion editorial product photography", stock:5 },
    ],
  },
  {
    category: "bags-and-accessories",
    name: "Silk Print Scarf", name_ar: "وشاح حرير بطبعة هادئة",
    description:    "A silk scarf with a soft print and light drape. Wear around the neck, on a bag, or in the hair.",
    description_ar: "وشاح حرير بطبعة هادئة وانسياب خفيف. حول الرقبة أو على الحقيبة أو في الشعر.",
    specs_en: "Material: silk twill\nSize: 70 × 70 cm\nDetails: hand-rolled edges\nCare: dry clean only",
    specs_ar: "الخامة: حرير تويل\nالمقاس: 70 × 70 سم\nالعناية: تنظيف جاف فقط",
    price: 520, old_price: 620, net_profit: 140,
    size_mode: "none", size_options: [],
    colors: [
      { key:"botanical", name:"Botanical", name_ar:"نباتي", value:"#6B8E6B", imageQuery:"woman green botanical silk scarf neck accessory fashion editorial",  stock:14 },
      { key:"marine",    name:"Marine",    name_ar:"بحري",  value:"#305F72", imageQuery:"woman blue marine silk scarf neck accessory fashion editorial",      stock:12 },
      { key:"ivory",     name:"Ivory",     name_ar:"عاجي",  value:"#EDE8DC", imageQuery:"woman ivory cream silk scarf neck accessory fashion editorial",     stock:10 },
    ],
  },
  {
    category: "bags-and-accessories",
    name: "Casual Comfort Sandals", name_ar: "صندل كاجوال مريح",
    description:    "Everyday sandals with a cushioned footbed and adjustable strap. For long days in warm seasons.",
    description_ar: "صندل يومي مريح بنعل مبطن وحزام قابل للتعديل.",
    specs_en: "Material: leather upper + rubber sole\nDetails: adjustable buckle strap\nFit: true to size",
    specs_ar: "الخامة: جزء علوي جلد + نعل مطاط\nالمقاس: يتوافق مع المقاس المعتاد",
    price: 880, old_price: 1040, net_profit: 200,
    size_mode: "numeric", size_options: ["37","38","39","40","41","42"],
    colors: [
      { key:"tan",   name:"Tan",   name_ar:"عسلي", value:"#B08968", imageQuery:"tan brown leather summer sandals fashion editorial product photography", stock:{"37":3,"38":5,"39":6,"40":5,"41":4,"42":2} },
      { key:"black", name:"Black", name_ar:"أسود", value:"#1A1A1A", imageQuery:"black leather summer sandals fashion editorial product photography",     stock:{"37":3,"38":5,"39":6,"40":5,"41":4,"42":2} },
    ],
  },
];

// ── Schema helpers ────────────────────────────────────────────────────────────
async function ensureColumn(connection, table, column, definition) {
  const [rows] = await connection.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
  if (rows.length === 0) {
    await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    console.log(`  ✔ Added column ${table}.${column}`);
  }
}

async function ensureCatalogSchema(connection) {
  await ensureColumn(connection, "products", "net_profit",   "DECIMAL(10,2) NOT NULL DEFAULT 0.00");
  await ensureColumn(connection, "products", "size_mode",    "VARCHAR(20) NOT NULL DEFAULT 'none'");
  await ensureColumn(connection, "products", "size_options", "JSON DEFAULT NULL");

  await connection.query("SET FOREIGN_KEY_CHECKS = 0");
  await connection.query("DROP TABLE IF EXISTS product_color_images");
  await connection.query("DROP TABLE IF EXISTS product_variants");
  await connection.query("DROP TABLE IF EXISTS product_colors");
  await connection.query("SET FOREIGN_KEY_CHECKS = 1");

  await connection.query(`
    CREATE TABLE product_colors (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      color_key  VARCHAR(120) DEFAULT NULL,
      name       VARCHAR(120) NOT NULL,
      name_ar    VARCHAR(120) DEFAULT NULL,
      value      VARCHAR(32)  NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_pc_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE product_color_images (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      color_id   INT NOT NULL,
      image_url  VARCHAR(2048) NOT NULL,
      is_main    TINYINT(1) DEFAULT 0,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_pci_color FOREIGN KEY (color_id) REFERENCES product_colors(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE product_variants (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      color_id   INT DEFAULT NULL,
      size_value VARCHAR(20) DEFAULT NULL,
      stock      INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_variant (product_id, color_id, size_value),
      CONSTRAINT fk_pv_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      CONSTRAINT fk_pv_color   FOREIGN KEY (color_id)   REFERENCES product_colors(id) ON DELETE CASCADE
    )
  `);

  console.log("  ✔ Color schema ready");
}

// ── Stock calculator ──────────────────────────────────────────────────────────
function sumProductStock(product) {
  return product.colors.reduce((sum, color) => {
    if ((product.size_mode || "none") !== "none") {
      return sum + Object.values(color.stock || {}).reduce((a, v) => a + Number(v || 0), 0);
    }
    return sum + Number(color.stock || 0);
  }, 0);
}

// ── Product inserter ──────────────────────────────────────────────────────────
// `colorImageMap` is  Map<colorKey, string[]>  — different images per color
async function insertProduct(connection, categoryIdMap, product, index, colorImageMap) {
  const categoryId = categoryIdMap.get(product.category);
  if (!categoryId) throw new Error(`Unknown category: "${product.category}"`);

  const totalStock = sumProductStock(product);
  const slug = `${slugify(product.name, { lower: true, strict: true })}-${index + 1}`;

  const [result] = await connection.query(
    `INSERT INTO products
       (category_id, name, name_ar, slug, description, description_ar,
        price, old_price, net_profit, stock, is_active, specs_en, specs_ar,
        size_mode, size_options)
     VALUES (?,?,?,?,?,?,?,?,?,?,1,?,?,?,?)`,
    [
      categoryId, product.name, product.name_ar, slug,
      product.description, product.description_ar,
      product.price, product.old_price || null, product.net_profit || 0,
      totalStock, product.specs_en || null, product.specs_ar || null,
      product.size_mode || "none", JSON.stringify(product.size_options || []),
    ]
  );
  const productId = result.insertId;

  for (const [ci, color] of product.colors.entries()) {
    const [cr] = await connection.query(
      `INSERT INTO product_colors (product_id, color_key, name, name_ar, value, sort_order)
       VALUES (?,?,?,?,?,?)`,
      [productId, color.key || null, color.name, color.name_ar || null, color.value, ci]
    );
    const colorId = cr.insertId;

    // ── Per-color images: swatch click → gallery switches to these ──────────
    const images = colorImageMap.get(color.key) || [];
    for (const [ii, url] of images.entries()) {
      await connection.query(
        `INSERT INTO product_color_images (color_id, image_url, is_main, sort_order)
         VALUES (?,?,?,?)`,
        [colorId, url, ii === 0 ? 1 : 0, ii]
      );
    }

    // ── Size variants ────────────────────────────────────────────────────────
    if ((product.size_mode || "none") !== "none") {
      for (const size of product.size_options || []) {
        await connection.query(
          `INSERT INTO product_variants (product_id, color_id, size_value, stock) VALUES (?,?,?,?)`,
          [productId, colorId, size, Number(color.stock?.[size] || 0)]
        );
      }
    } else {
      await connection.query(
        `INSERT INTO product_variants (product_id, color_id, size_value, stock) VALUES (?,?,NULL,?)`,
        [productId, colorId, Number(color.stock || 0)]
      );
    }
  }

  console.log(`  ✔ ${product.name} — ${product.colors.length} color(s), stock: ${totalStock}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function seedFashionCatalog() {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    console.log("🔧 Ensuring schema…");
    await ensureCatalogSchema(connection);

    console.log("🗑  Clearing old catalog data…");
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    for (const t of [
      "wallet_transactions","order_items","orders","reviews",
      "wishlist","cart_items","carts",
      "product_variants","product_color_images","product_colors",
      "product_images","products","categories",
    ]) {
      await connection.query(`TRUNCATE TABLE \`${t}\``);
    }
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    // ── Fetch category images ───────────────────────────────────────────────
    console.log("\n🌐 Fetching category images from Pexels…");
    const catImgMap = new Map();
    for (const cat of categories) {
      const [url] = await pexelsSearch(cat.imageQuery, 1, "landscape");
      catImgMap.set(cat.slug, url);
      console.log(`  ✔ ${cat.name}`);
    }

    // ── Fetch per-color images ──────────────────────────────────────────────
    // Map<productName, Map<colorKey, string[]>>
    console.log("\n🌐 Fetching per-color images from Pexels…");
    const productColorMap = new Map();
    for (const product of products) {
      const colorMap = new Map();
      for (const color of product.colors) {
        const urls = await pexelsSearch(color.imageQuery, 3, "portrait");
        colorMap.set(color.key, urls);
        console.log(`  ✔ ${product.name} / ${color.name} → ${urls.length} photos`);
      }
      productColorMap.set(product.name, colorMap);
    }

    // ── Insert categories ───────────────────────────────────────────────────
    console.log(`\n📂 Inserting ${categories.length} categories…`);
    const categoryIdMap = new Map();
    for (const [i, cat] of categories.entries()) {
      const [r] = await connection.query(
        `INSERT INTO categories (name, name_ar, slug, icon, image_url, is_active, sort_order)
         VALUES (?,?,?,?,?,1,?)`,
        [cat.name, cat.name_ar, cat.slug, cat.icon, catImgMap.get(cat.slug) || "", i]
      );
      categoryIdMap.set(cat.slug, r.insertId);
      console.log(`  ✔ ${cat.name}`);
    }

    // ── Insert products ─────────────────────────────────────────────────────
    console.log(`\n👗 Inserting ${products.length} products…`);
    for (const [i, product] of products.entries()) {
      const colorImageMap = productColorMap.get(product.name) || new Map();
      await insertProduct(connection, categoryIdMap, product, i, colorImageMap);
    }

    await connection.commit();
    console.log(`\n✅ Seeded ${categories.length} categories and ${products.length} products successfully.`);
  } catch (err) {
    await connection.rollback();
    console.error("\n❌ Catalog seeding failed:", err.message);
    console.error(err.stack);
    process.exitCode = 1;
  } finally {
    connection.release();
    process.exit(process.exitCode || 0);
  }
}

seedFashionCatalog();
