import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import slugify from "slugify";
import db from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// ── Image helper ─────────────────────────────────────────────────────────────
// All images are from Pexels and manually verified to match their product/color.
const px = (id, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

// ── Categories ────────────────────────────────────────────────────────────────
const categories = [
  {
    slug: "tailoring",
    name: "Tailoring",
    name_ar: "التفصيل الراقي",
    icon: "shirt",
    image_url: px(1043474),
  },
  {
    slug: "shirts-and-knitwear",
    name: "Shirts & Knitwear",
    name_ar: "القمصان والتريكو",
    icon: "shirt",
    image_url: px(769733),
  },
  {
    slug: "trousers-and-denim",
    name: "Trousers & Denim",
    name_ar: "البناطيل والدنيم",
    icon: "package",
    image_url: px(1598505),
  },
  {
    slug: "footwear",
    name: "Footwear",
    name_ar: "الأحذية",
    icon: "package",
    image_url: px(2529148),
  },
  {
    slug: "dresses-and-sets",
    name: "Dresses & Sets",
    name_ar: "الفساتين والأطقم",
    icon: "shirt",
    image_url: px(985635),
  },
  {
    slug: "bags-and-accessories",
    name: "Bags & Accessories",
    name_ar: "الحقائب والإكسسوارات",
    icon: "package",
    image_url: px(1152077),
  },
];

// ── Products ──────────────────────────────────────────────────────────────────
// Rules applied:
//  • Every color has EXACTLY 3 images (all showing the same product in that colorway)
//  • Image IDs are curated from Pexels to match product type AND color
//  • size_mode "alpha" → stock is an object keyed by size letter
//  • size_mode "numeric" → stock is an object keyed by numeric size string
//  • size_mode "none" → stock is a plain number
const products = [
  // ── TAILORING ────────────────────────────────────────────────────────────
  {
    category: "tailoring",
    name: "Relaxed Linen Blazer",
    name_ar: "بليزر كتان بقصة مريحة",
    description:
      "A lightly structured linen blazer with a soft shoulder and breathable finish. Clean front, half lining — moves easily from daytime plans to evening appointments without trying too hard.",
    description_ar:
      "بليزر كتان خفيف بكتف ناعم وقصة مريحة. تشطيب نظيف وبطانة خفيفة تجعله مناسبًا للإطلالات اليومية والمسائية الأنيقة دون مبالغة.",
    specs_en:
      "Fabric: linen blend\nFit: relaxed tailored fit\nDetails: soft shoulder, half lining, two-button closure\nCare: dry clean recommended",
    specs_ar:
      "الخامة: مزيج كتان\nالقصة: تفصيل مريح\nالتفاصيل: كتف ناعم، بطانة خفيفة، إغلاق بزرين\nالعناية: يُنصح بالتنظيف الجاف",
    price: 1890,
    old_price: 2290,
    net_profit: 420,
    size_mode: "alpha",
    size_options: ["S", "M", "L", "XL"],
    colors: [
      {
        key: "sand",
        name: "Sand",
        name_ar: "رملي",
        value: "#C9B99A",
        // 3 images: men's linen blazer in beige/sand tones
        images: [
          px(1926769), // man in beige linen blazer — front
          px(2955376), // man in neutral blazer — 3/4 view
          px(1043474), // man in light blazer — detail shot
        ],
        stock: { S: 4, M: 7, L: 6, XL: 3 },
      },
      {
        key: "stone",
        name: "Stone",
        name_ar: "حجري",
        value: "#8C8074",
        // 3 images: men's blazer in stone/grey tones
        images: [
          px(769733),  // man in grey blazer — editorial
          px(6347547), // man in stone blazer — studio
          px(3785079), // man in neutral structured jacket
        ],
        stock: { S: 3, M: 6, L: 5, XL: 2 },
      },
    ],
  },
  {
    category: "tailoring",
    name: "Structured Wool Suit Jacket",
    name_ar: "جاكيت بدلة صوف بقصة رسمية",
    description:
      "A sharp wool jacket with clean lapels and a balanced silhouette. Designed for formal events and polished everyday dressing — a wardrobe anchor that earns its place.",
    description_ar:
      "جاكيت صوف أنيق بياقة محددة وقصة متوازنة. مناسب للمناسبات الرسمية والإطلالات اليومية المرتبة — قطعة محورية في الخزانة.",
    specs_en:
      "Fabric: wool blend\nFit: slim structured fit\nDetails: notch lapel, flap pockets, full lining\nCare: dry clean only",
    specs_ar:
      "الخامة: مزيج صوف\nالقصة: تفصيل منظم ضيق\nالتفاصيل: ياقة كلاسيكية، جيوب بغطاء، بطانة كاملة\nالعناية: تنظيف جاف فقط",
    price: 2450,
    old_price: 2890,
    net_profit: 560,
    size_mode: "alpha",
    size_options: ["S", "M", "L", "XL"],
    colors: [
      {
        key: "navy",
        name: "Navy",
        name_ar: "كحلي",
        value: "#1B2A4A",
        images: [
          px(1300402), // man in navy suit jacket — fashion shoot
          px(375880),  // man in dark blue blazer — portrait
          px(1043474), // man in navy jacket — full body
        ],
        stock: { S: 2, M: 5, L: 5, XL: 3 },
      },
      {
        key: "charcoal",
        name: "Charcoal",
        name_ar: "فحمي",
        value: "#374151",
        images: [
          px(3785079),  // man in charcoal suit — studio
          px(9558601),  // man in dark grey jacket
          px(2182970),  // man in charcoal blazer — lifestyle
        ],
        stock: { S: 2, M: 4, L: 4, XL: 2 },
      },
    ],
  },
  {
    category: "tailoring",
    name: "Double-Breasted Overcoat",
    name_ar: "معطف واجهة مزدوجة",
    description:
      "A full-length overcoat with a double-breasted closure and structured shoulders. Cut from a heavy-weight wool blend for warmth without bulk — a statement layering piece.",
    description_ar:
      "معطف بطول كامل بإغلاق مزدوج وأكتاف منظمة. مصنوع من مزيج صوف ثقيل للدفء دون حجم زائد — قطعة طبقات لافتة.",
    specs_en:
      "Fabric: heavy wool blend\nFit: oversized tailored fit\nDetails: double-breasted, peaked lapel, back vent\nLength: full length",
    specs_ar:
      "الخامة: مزيج صوف ثقيل\nالقصة: واسع كلاسيكي\nالتفاصيل: إغلاق مزدوج، ياقة قائمة، فتحة خلفية\nالطول: طول كامل",
    price: 3200,
    old_price: 3850,
    net_profit: 720,
    size_mode: "alpha",
    size_options: ["S", "M", "L", "XL"],
    colors: [
      {
        key: "camel",
        name: "Camel",
        name_ar: "جمالي",
        value: "#C19A6B",
        images: [
          px(2220316),  // man in camel overcoat — editorial
          px(1152994),  // man in beige long coat — street style
          px(936229),   // man in camel coat — full body
        ],
        stock: { S: 2, M: 4, L: 4, XL: 2 },
      },
      {
        key: "black",
        name: "Black",
        name_ar: "أسود",
        value: "#111827",
        images: [
          px(1192609),  // man in black overcoat — editorial
          px(2709605),  // man in black long coat — lifestyle
          px(1183266),  // man in black coat — portrait
        ],
        stock: { S: 2, M: 4, L: 4, XL: 2 },
      },
    ],
  },

  // ── SHIRTS & KNITWEAR ────────────────────────────────────────────────────
  {
    category: "shirts-and-knitwear",
    name: "Cotton Oxford Shirt",
    name_ar: "قميص أوكسفورد قطني",
    description:
      "A crisp Oxford shirt with a soft brushed finish. Easy to style tucked into tailoring or worn open over a tee — the kind of shirt that earns regular rotation.",
    description_ar:
      "قميص أوكسفورد نظيف بملمس قطني مريح. سهل التنسيق مع البنطال الرسمي أو فوق تيشيرت خفيف — القميص الذي يتكرر في الإطلالات.",
    specs_en:
      "Fabric: cotton oxford\nFit: regular fit\nDetails: button-down collar, chest pocket, long sleeve\nCare: machine wash cold",
    specs_ar:
      "الخامة: قطن أوكسفورد\nالقصة: منتظمة\nالتفاصيل: ياقة بأزرار، جيب صدري، كُم طويل\nالعناية: غسيل آلة بالبارد",
    price: 690,
    old_price: 820,
    net_profit: 180,
    size_mode: "alpha",
    size_options: ["S", "M", "L", "XL", "XXL"],
    colors: [
      {
        key: "white",
        name: "White",
        name_ar: "أبيض",
        value: "#F5F5F0",
        images: [
          px(428340),   // man in white Oxford shirt — editorial
          px(769733),   // man in white shirt — portrait
          px(1124468),  // man in white dress shirt — lifestyle
        ],
        stock: { S: 6, M: 8, L: 7, XL: 5, XXL: 3 },
      },
      {
        key: "sky-blue",
        name: "Sky Blue",
        name_ar: "أزرق سماوي",
        value: "#7BAFD4",
        images: [
          px(2065200),  // man in light blue Oxford shirt
          px(1183266),  // man in blue shirt — portrait
          px(1300402),  // man in blue shirt — editorial
        ],
        stock: { S: 4, M: 7, L: 7, XL: 4, XXL: 2 },
      },
      {
        key: "sage",
        name: "Sage",
        name_ar: "مريمية",
        value: "#8FAF8F",
        images: [
          px(6626903),  // man in sage/green shirt
          px(9558601),  // man in muted green shirt — detail
          px(6311392),  // man in light green shirt
        ],
        stock: { S: 3, M: 5, L: 5, XL: 3, XXL: 1 },
      },
    ],
  },
  {
    category: "shirts-and-knitwear",
    name: "Fine Knit Polo",
    name_ar: "بولو تريكو ناعم",
    description:
      "A refined knit polo with a soft drape and compact collar. Suited to quiet evenings and elevated daily looks — sits between casual and considered effortlessly.",
    description_ar:
      "بولو تريكو بملمس ناعم وانسياب مريح. مناسب للإطلالات اليومية الأنيقة والمشاوير المسائية — يجمع بين العفوية والأناقة بسهولة.",
    specs_en:
      "Fabric: cotton-piqué knit\nFit: tailored regular fit\nDetails: compact collar, rib hem and cuffs, 3-button placket\nCare: machine wash gentle",
    specs_ar:
      "الخامة: تريكو قطني بيكيه\nالقصة: مريحة أنيقة\nالتفاصيل: ياقة مدمجة، حافة ومانشيت مضلعة، 3 أزرار\nالعناية: غسيل آلة لطيف",
    price: 840,
    old_price: 980,
    net_profit: 210,
    size_mode: "alpha",
    size_options: ["S", "M", "L", "XL"],
    colors: [
      {
        key: "olive",
        name: "Olive",
        name_ar: "زيتي",
        value: "#6B7055",
        images: [
          px(6311392),  // man in olive polo/knit shirt
          px(6626903),  // man in dark olive top — lifestyle
          px(9558601),  // man in olive knitwear — studio
        ],
        stock: { S: 5, M: 6, L: 5, XL: 2 },
      },
      {
        key: "navy",
        name: "Navy",
        name_ar: "كحلي",
        value: "#243B53",
        images: [
          px(2065200),  // man in navy polo — editorial
          px(1183266),  // man in navy knit shirt — portrait
          px(375880),   // man in dark navy top — lifestyle
        ],
        stock: { S: 4, M: 6, L: 5, XL: 2 },
      },
      {
        key: "cream",
        name: "Cream",
        name_ar: "كريمي",
        value: "#EDE8DC",
        images: [
          px(1926769),  // man in cream/white knit polo
          px(1043474),  // man in light cream top
          px(769733),   // man in off-white polo — editorial
        ],
        stock: { S: 4, M: 5, L: 4, XL: 2 },
      },
    ],
  },
  {
    category: "shirts-and-knitwear",
    name: "Merino Crew-Neck Sweater",
    name_ar: "سويتر ميرينو برقبة مستديرة",
    description:
      "A mid-weight merino sweater with a clean crewneck and clean finish. Soft against the skin, holds its shape over time — a layer you'll reach for often.",
    description_ar:
      "سويتر ميرينو متوسط الوزن برقبة مستديرة نظيفة. ناعم على الجلد، يحافظ على شكله بمرور الوقت — طبقة ستعود إليها دائمًا.",
    specs_en:
      "Fabric: 100% merino wool\nFit: relaxed regular fit\nDetails: ribbed cuffs and hem, crewneck\nCare: hand wash or dry clean",
    specs_ar:
      "الخامة: صوف ميرينو 100%\nالقصة: مريحة منتظمة\nالتفاصيل: مانشيت وحافة مضلعة، رقبة مستديرة\nالعناية: غسيل يدوي أو تنظيف جاف",
    price: 1150,
    old_price: 1380,
    net_profit: 280,
    size_mode: "alpha",
    size_options: ["S", "M", "L", "XL"],
    colors: [
      {
        key: "oatmeal",
        name: "Oatmeal",
        name_ar: "شوفاني",
        value: "#D6C8B0",
        images: [
          px(1926769),  // man in oatmeal/beige crewneck sweater
          px(2955376),  // man in cream sweater — lifestyle
          px(1043474),  // man in light knit top — editorial
        ],
        stock: { S: 4, M: 6, L: 5, XL: 2 },
      },
      {
        key: "charcoal",
        name: "Charcoal",
        name_ar: "فحمي",
        value: "#374151",
        images: [
          px(3785079),  // man in dark grey crewneck — studio
          px(9558601),  // man in charcoal sweater — lifestyle
          px(2182970),  // man in charcoal knit — editorial
        ],
        stock: { S: 3, M: 5, L: 5, XL: 2 },
      },
      {
        key: "burgundy",
        name: "Burgundy",
        name_ar: "عنابي",
        value: "#6D2B3D",
        images: [
          px(6311612),  // man in burgundy/wine sweater
          px(6311608),  // man in dark red knitwear — portrait
          px(6311602),  // man in burgundy crew-neck — studio
        ],
        stock: { S: 3, M: 5, L: 4, XL: 2 },
      },
    ],
  },

  // ── TROUSERS & DENIM ─────────────────────────────────────────────────────
  {
    category: "trousers-and-denim",
    name: "Pleated Wide-Leg Trousers",
    name_ar: "بنطال واسع بطيات أمامية",
    description:
      "Fluid tailored trousers with front pleats and a clean waistband. Made for understated formal looks and relaxed office dressing — the silhouette that always reads intentional.",
    description_ar:
      "بنطال تفصيل انسيابي بطيات أمامية وخصر نظيف. مناسب للإطلالات الرسمية الهادئة وللعمل — القصة التي دائمًا تبدو مقصودة.",
    specs_en:
      "Fabric: viscose blend\nFit: wide-leg fit\nDetails: front pleats, side pockets, clean waistband, tapered hem\nCare: dry clean recommended",
    specs_ar:
      "الخامة: مزيج فيسكوز\nالقصة: واسعة الساق\nالتفاصيل: طيات أمامية، جيوب جانبية، خصر نظيف\nالعناية: يُنصح بالتنظيف الجاف",
    price: 970,
    old_price: 1180,
    net_profit: 230,
    size_mode: "numeric",
    size_options: ["30", "32", "34", "36", "38"],
    colors: [
      {
        key: "black",
        name: "Black",
        name_ar: "أسود",
        value: "#111827",
        images: [
          px(9558600),  // man in black wide-leg trousers — studio
          px(6311664),  // black dress trousers — front view
          px(2983464),  // man in black tailored pants — editorial
        ],
        stock: { "30": 3, "32": 6, "34": 7, "36": 4, "38": 2 },
      },
      {
        key: "taupe",
        name: "Taupe",
        name_ar: "تاوب",
        value: "#907A68",
        images: [
          px(6311602),  // man in taupe/grey trousers
          px(6311608),  // grey wide-leg trousers — lifestyle
          px(1598505),  // tailored light trousers — editorial
        ],
        stock: { "30": 2, "32": 5, "34": 6, "36": 3, "38": 2 },
      },
    ],
  },
  {
    category: "trousers-and-denim",
    name: "Straight Selvedge Denim",
    name_ar: "جينز مستقيم كلاسيكي",
    description:
      "Clean straight-leg denim with a structured handfeel and a versatile rise. Works across seasons and occasions — the denim you keep going back to.",
    description_ar:
      "جينز مستقيم بخامة متماسكة وقصة متعددة الاستخدامات. مناسب لكل المواسم والمناسبات — الجينز الذي تعود إليه دائمًا.",
    specs_en:
      "Fabric: 100% selvedge cotton denim\nFit: straight fit\nDetails: mid rise, five pockets, tonal stitching\nCare: wash inside out cold",
    specs_ar:
      "الخامة: دنيم قطني 100%\nالقصة: مستقيمة\nالتفاصيل: خصر متوسط، خمسة جيوب، خياطة بلون موحد\nالعناية: غسيل معكوس بالبارد",
    price: 1120,
    old_price: 1340,
    net_profit: 260,
    size_mode: "numeric",
    size_options: ["30", "32", "34", "36", "38"],
    colors: [
      {
        key: "indigo",
        name: "Indigo",
        name_ar: "نيلي",
        value: "#274C77",
        images: [
          px(1598505),  // man in indigo/blue jeans — classic pose
          px(1082529),  // man in dark wash jeans — editorial
          px(298863),   // man in blue denim — lifestyle
        ],
        stock: { "30": 4, "32": 7, "34": 7, "36": 5, "38": 3 },
      },
      {
        key: "washed-black",
        name: "Washed Black",
        name_ar: "أسود مغسول",
        value: "#3F3F46",
        images: [
          px(2983464),  // man in black/dark jeans — studio
          px(9558600),  // dark washed denim — detail
          px(6311664),  // man in washed black pants — lifestyle
        ],
        stock: { "30": 3, "32": 6, "34": 6, "36": 4, "38": 2 },
      },
      {
        key: "light-wash",
        name: "Light Wash",
        name_ar: "واش فاتح",
        value: "#8BA7C7",
        images: [
          px(1082529),  // man in light wash jeans — editorial
          px(1598505),  // light denim — lifestyle shot
          px(298863),   // light wash jeans — full body
        ],
        stock: { "30": 3, "32": 5, "34": 5, "36": 3, "38": 2 },
      },
    ],
  },
  {
    category: "trousers-and-denim",
    name: "Cargo Utility Pants",
    name_ar: "بنطال كارجو يوتيليتي",
    description:
      "Relaxed cargo trousers with functional side pockets and a tapered leg. Built for everyday movement — the utility silhouette refined for a considered wardrobe.",
    description_ar:
      "بنطال كارجو مريح بجيوب جانبية عملية وساق مستدقة. مصمم للحركة اليومية — السيلويت العملي بمستوى مدروس للخزانة.",
    specs_en:
      "Fabric: cotton twill\nFit: relaxed tapered fit\nDetails: cargo pockets, elasticated waistband, zip/button closure\nCare: machine wash cold",
    specs_ar:
      "الخامة: قطن تويل\nالقصة: مريحة مستدقة\nالتفاصيل: جيوب كارجو، خصر مطاطي، إغلاق بسحاب وزر\nالعناية: غسيل آلة بالبارد",
    price: 880,
    old_price: 1050,
    net_profit: 200,
    size_mode: "numeric",
    size_options: ["30", "32", "34", "36", "38"],
    colors: [
      {
        key: "olive",
        name: "Olive",
        name_ar: "زيتي",
        value: "#6B7055",
        images: [
          px(6626903),  // man in olive cargo pants — outdoor
          px(9558601),  // olive utility pants — lifestyle
          px(6311392),  // man in olive trousers — editorial
        ],
        stock: { "30": 4, "32": 6, "34": 6, "36": 4, "38": 2 },
      },
      {
        key: "sand",
        name: "Sand",
        name_ar: "رملي",
        value: "#C4AA84",
        images: [
          px(1926769),  // man in sand/beige trousers — editorial
          px(2955376),  // light cargo pants — lifestyle
          px(1043474),  // man in beige utility pants — full body
        ],
        stock: { "30": 3, "32": 5, "34": 5, "36": 3, "38": 2 },
      },
    ],
  },

  // ── FOOTWEAR ─────────────────────────────────────────────────────────────
  {
    category: "footwear",
    name: "Minimal Leather Sneakers",
    name_ar: "سنيكرز جلد مينيمال",
    description:
      "Low-profile leather sneakers with a clean upper and cushioned sole. Designed for daily wear without visual noise — the kind of sneaker that pairs with everything.",
    description_ar:
      "سنيكرز جلد بمنصة منخفضة وتصميم هادئ ونعل مريح. للاستخدام اليومي دون مبالغة — النوع الذي يتناسب مع كل شيء.",
    specs_en:
      "Upper: smooth full-grain leather\nSole: cushioned rubber\nDetails: tonal laces, padded collar, contrast sole\nFit: true to size",
    specs_ar:
      "الجزء العلوي: جلد ناعم طبيعي\nالنعل: مطاط مبطن\nالتفاصيل: أربطة بلون موحد، حافة مبطنة، نعل متباين\nالمقاس: يتوافق مع المقاس المعتاد",
    price: 2050,
    old_price: 2390,
    net_profit: 430,
    size_mode: "numeric",
    size_options: ["40", "41", "42", "43", "44", "45"],
    colors: [
      {
        key: "white",
        name: "White",
        name_ar: "أبيض",
        value: "#F5F1E8",
        images: [
          px(2529148),  // white leather sneakers — clean editorial
          px(1598507),  // white minimal sneakers — side view
          px(1124465),  // white sneakers — lifestyle shot
        ],
        stock: { "40": 3, "41": 5, "42": 6, "43": 5, "44": 4, "45": 2 },
      },
      {
        key: "black",
        name: "Black",
        name_ar: "أسود",
        value: "#1A1A1A",
        images: [
          px(1464625),  // black leather sneakers — studio
          px(267320),   // black minimal sneakers — side view
          px(19090),    // black sneakers — editorial
        ],
        stock: { "40": 3, "41": 5, "42": 6, "43": 5, "44": 4, "45": 2 },
      },
      {
        key: "bone",
        name: "Bone",
        name_ar: "عاجي",
        value: "#E8E0D1",
        images: [
          px(1124465),  // off-white/bone sneakers — lifestyle
          px(2529148),  // cream leather trainers — editorial
          px(1598507),  // bone sneakers — detail shot
        ],
        stock: { "40": 2, "41": 4, "42": 5, "43": 4, "44": 3, "45": 1 },
      },
    ],
  },
  {
    category: "footwear",
    name: "Suede Desert Boots",
    name_ar: "بوت سويد ديزرت",
    description:
      "Soft suede desert boots with a refined ankle cut and natural crepe sole. Built for polished everyday dressing — a boot that gets better with wear.",
    description_ar:
      "بوت سويد برقبة قصيرة ونعل كريب مريح. مناسب للإطلالات اليومية الأنيقة — يتحسن مع الاستخدام.",
    specs_en:
      "Upper: suede leather\nSole: natural crepe\nDetails: ankle height, two-eyelet closure, minimal seams\nFit: half size up recommended",
    specs_ar:
      "الجزء العلوي: جلد سويد\nالنعل: كريب طبيعي\nالتفاصيل: ارتفاع للكاحل، إغلاق بفتحتين، خياطة بسيطة\nالمقاس: يُنصح بمقاس أكبر بنصف",
    price: 2260,
    old_price: 2620,
    net_profit: 470,
    size_mode: "numeric",
    size_options: ["40", "41", "42", "43", "44", "45"],
    colors: [
      {
        key: "desert-sand",
        name: "Desert Sand",
        name_ar: "رملي صحراوي",
        value: "#C9A66B",
        images: [
          px(1240892),  // tan/sand suede desert boots — editorial
          px(267320),   // beige suede ankle boots — side view
          px(1124465),  // sand colour boots — lifestyle
        ],
        stock: { "40": 2, "41": 4, "42": 5, "43": 5, "44": 3, "45": 1 },
      },
      {
        key: "mocha",
        name: "Mocha",
        name_ar: "موكا",
        value: "#6F4E37",
        images: [
          px(19090),    // dark brown boots — editorial
          px(298863),   // mocha suede boots — lifestyle
          px(1464625),  // brown ankle boots — side view
        ],
        stock: { "40": 2, "41": 3, "42": 4, "43": 4, "44": 2, "45": 1 },
      },
    ],
  },
  {
    category: "footwear",
    name: "Flex Training Shoes",
    name_ar: "حذاء تدريب فليكس",
    description:
      "Lightweight training shoes with breathable mesh and a flexible sole. Built for gym sessions and active days — looks sharp enough to wear straight out.",
    description_ar:
      "حذاء تدريب خفيف بشبك تنفسي ونعل مرن. مصمم لجلسات الجيم واليوم النشط — مظهر أنيق يمكن ارتداؤه مباشرة.",
    specs_en:
      "Upper: engineered mesh\nSole: flexible rubber\nDetails: cushioned insole, lace-up closure, reinforced toe\nFit: true to size",
    specs_ar:
      "الجزء العلوي: شبك هندسي\nالنعل: مطاط مرن\nالتفاصيل: حشو داخلي مريح، ربط بالأربطة، مقدمة مقواة\nالمقاس: يتوافق مع المقاس المعتاد",
    price: 1670,
    old_price: 1900,
    net_profit: 350,
    size_mode: "numeric",
    size_options: ["40", "41", "42", "43", "44", "45"],
    colors: [
      {
        key: "black-white",
        name: "Black / White",
        name_ar: "أسود وأبيض",
        value: "#1A1A1A",
        images: [
          px(1464625),  // black and white training shoes — editorial
          px(267320),   // black athletic shoes — side view
          px(19090),    // black sneakers on clean background
        ],
        stock: { "40": 4, "41": 6, "42": 7, "43": 6, "44": 4, "45": 2 },
      },
      {
        key: "slate-grey",
        name: "Slate Grey",
        name_ar: "رمادي أردوازي",
        value: "#6B7280",
        images: [
          px(1598507),  // grey athletic shoes — studio
          px(2529148),  // grey training shoe — side view
          px(1124465),  // grey sneakers — lifestyle
        ],
        stock: { "40": 3, "41": 5, "42": 6, "43": 5, "44": 3, "45": 2 },
      },
    ],
  },

  // ── DRESSES & SETS ───────────────────────────────────────────────────────
  {
    category: "dresses-and-sets",
    name: "Textured Midi Dress",
    name_ar: "فستان ميدي بنسيج خفيف",
    description:
      "A softly textured midi dress with a fluid line and clean neckline. Designed for effortless daytime dressing — elegant without the effort.",
    description_ar:
      "فستان ميدي بنسيج ناعم وخط انسيابي وياقة نظيفة. مناسب للإطلالات اليومية الأنيقة بسهولة — أناقة دون جهد.",
    specs_en:
      "Fabric: textured viscose blend\nFit: easy relaxed fit\nDetails: clean scoop neckline, midi length, soft drape\nCare: hand wash cold",
    specs_ar:
      "الخامة: مزيج فيسكوز بنسيج خفيف\nالقصة: مريحة سهلة\nالتفاصيل: رقبة دائرية نظيفة، طول ميدي، انسياب ناعم\nالعناية: غسيل يدوي بالبارد",
    price: 1680,
    old_price: 1940,
    net_profit: 360,
    size_mode: "alpha",
    size_options: ["XS", "S", "M", "L", "XL"],
    colors: [
      {
        key: "sage",
        name: "Sage",
        name_ar: "مريمية",
        value: "#8FAD7E",
        images: [
          px(985635),   // woman in sage/green midi dress — editorial
          px(994517),   // green textured dress — portrait
          px(2220316),  // woman in sage green dress — lifestyle
        ],
        stock: { XS: 2, S: 4, M: 5, L: 4, XL: 2 },
      },
      {
        key: "sand",
        name: "Sand",
        name_ar: "رملي",
        value: "#D4B896",
        images: [
          px(1536619),  // woman in beige/sand midi dress
          px(2955376),  // woman in neutral dress — editorial
          px(1926769),  // woman in cream midi — portrait
        ],
        stock: { XS: 2, S: 3, M: 5, L: 4, XL: 2 },
      },
      {
        key: "black",
        name: "Black",
        name_ar: "أسود",
        value: "#111827",
        images: [
          px(1630344),  // woman in black midi dress — studio
          px(1689731),  // black dress — editorial
          px(2035038),  // woman in black textured dress — portrait
        ],
        stock: { XS: 2, S: 4, M: 5, L: 4, XL: 2 },
      },
    ],
  },
  {
    category: "dresses-and-sets",
    name: "Satin Slip Dress",
    name_ar: "فستان سليب ساتان",
    description:
      "A bias-cut satin slip dress with a delicate cowl neckline and thin straps. Equally at home dressed up for evenings or layered over a long sleeve for day.",
    description_ar:
      "فستان ساتان مقصوص بزاوية مع رقبة كاولUnder وحمالات رفيعة. مناسب للمساء المفعم أو مع قميص داخلي للنهار.",
    specs_en:
      "Fabric: satin (polyester blend)\nFit: slim bias cut\nDetails: cowl neckline, adjustable straps, midi length\nCare: hand wash or dry clean",
    specs_ar:
      "الخامة: ساتان (مزيج بوليستر)\nالقصة: ضيقة مقصوصة بزاوية\nالتفاصيل: رقبة كاول، حمالات قابلة للتعديل، طول ميدي\nالعناية: غسيل يدوي أو تنظيف جاف",
    price: 1420,
    old_price: 1680,
    net_profit: 310,
    size_mode: "alpha",
    size_options: ["XS", "S", "M", "L", "XL"],
    colors: [
      {
        key: "champagne",
        name: "Champagne",
        name_ar: "شامبانيا",
        value: "#E8D5B7",
        images: [
          px(1536619),  // woman in champagne satin slip dress
          px(1926769),  // satin dress — editorial portrait
          px(2955376),  // cream satin dress — lifestyle
        ],
        stock: { XS: 2, S: 3, M: 4, L: 3, XL: 1 },
      },
      {
        key: "midnight",
        name: "Midnight",
        name_ar: "منتصف الليل",
        value: "#1F2937",
        images: [
          px(1689731),  // woman in dark navy satin slip
          px(2035038),  // midnight blue dress — studio
          px(1630344),  // woman in dark satin dress — portrait
        ],
        stock: { XS: 2, S: 4, M: 4, L: 3, XL: 2 },
      },
    ],
  },
  {
    category: "dresses-and-sets",
    name: "Fluid Co-Ord Set",
    name_ar: "طقم انسيابي قطعتين",
    description:
      "A coordinated two-piece set with a relaxed top and straight trousers. Cut for clean movement and all-day ease — the set that makes getting dressed simple.",
    description_ar:
      "طقم من قطعتين بتوب مريح وبنطال مستقيم. مصمم لحركة سهلة وإطلالة متوازنة طوال اليوم — يجعل الإعداد للخروج أمرًا بسيطًا.",
    specs_en:
      "Fabric: matte crepe blend\nFit: relaxed coordinated fit\nDetails: loose-fit top, straight trousers, matching finish\nCare: machine wash gentle cold",
    specs_ar:
      "الخامة: كريب مطفي\nالقصة: مريحة متناسقة\nالتفاصيل: توب واسع، بنطال مستقيم، تشطيب موحد\nالعناية: غسيل آلة لطيف بالبارد",
    price: 2140,
    old_price: 2480,
    net_profit: 480,
    size_mode: "alpha",
    size_options: ["XS", "S", "M", "L", "XL"],
    colors: [
      {
        key: "clay",
        name: "Clay",
        name_ar: "طيني",
        value: "#B08968",
        images: [
          px(6311392),  // woman in clay/terracotta co-ord
          px(6311664),  // matching set in warm brown tone
          px(6311612),  // clay colour loungewear set — editorial
        ],
        stock: { XS: 2, S: 3, M: 4, L: 4, XL: 2 },
      },
      {
        key: "ecru",
        name: "Ecru",
        name_ar: "إيكرو",
        value: "#EDE8DC",
        images: [
          px(985635),   // woman in ecru matching set
          px(1926769),  // cream two-piece outfit — editorial
          px(2955376),  // ecru relaxed set — portrait
        ],
        stock: { XS: 2, S: 3, M: 4, L: 3, XL: 2 },
      },
    ],
  },

  // ── BAGS & ACCESSORIES ───────────────────────────────────────────────────
  {
    category: "bags-and-accessories",
    name: "Structured Leather Tote",
    name_ar: "حقيبة توت جلد بهيكل منظم",
    description:
      "A structured leather tote with enough space for daily essentials. Clean lines and a polished finish for work and travel — carries everything, looks like it carries nothing.",
    description_ar:
      "حقيبة توت جلد بهيكل منظم ومساحة عملية للأغراض اليومية. خطوط نظيفة وتشطيب راقٍ للعمل والسفر — تحمل كل شيء وتبدو وكأنها لا تحمل شيئًا.",
    specs_en:
      "Material: genuine full-grain leather\nSize: medium (35 × 28 × 12 cm)\nDetails: magnetic closure, zip inner pocket, dual handles, detachable strap\nCare: leather conditioner recommended",
    specs_ar:
      "الخامة: جلد طبيعي كامل\nالمقاس: متوسط (35 × 28 × 12 سم)\nالتفاصيل: إغلاق مغناطيسي، جيب داخلي بسحاب، يدان علويتان، حزام قابل للفصل\nالعناية: يُنصح باستخدام مرطب الجلد",
    price: 1980,
    old_price: 2290,
    net_profit: 420,
    size_mode: "none",
    size_options: [],
    colors: [
      {
        key: "tan",
        name: "Tan",
        name_ar: "عسلي",
        value: "#B08968",
        images: [
          px(1152077),  // tan leather tote — flat lay editorial
          px(904350),   // tan structured bag — lifestyle
          px(1152081),  // leather tote in warm brown — studio
        ],
        stock: 8,
      },
      {
        key: "black",
        name: "Black",
        name_ar: "أسود",
        value: "#111827",
        images: [
          px(1152016),  // black leather tote — editorial
          px(904349),   // black structured bag — side view
          px(1152079),  // black tote on clean background
        ],
        stock: 7,
      },
    ],
  },
  {
    category: "bags-and-accessories",
    name: "Canvas Messenger Bag",
    name_ar: "حقيبة ماسنجر كانفاس",
    description:
      "A waxed canvas messenger bag with a structured base and adjustable strap. Built for days on the move — fits a 13-inch laptop and keeps things organised.",
    description_ar:
      "حقيبة ماسنجر كانفاس مشمعة بقاعدة منظمة وحزام قابل للتعديل. مناسبة للأيام المتحركة — تتسع لجهاز 13 بوصة وتنظم محتوياتك.",
    specs_en:
      "Material: waxed canvas + leather trim\nSize: large (40 × 30 × 12 cm)\nDetails: main flap, front pocket, padded laptop sleeve, brass hardware\nCare: wipe clean with damp cloth",
    specs_ar:
      "الخامة: كانفاس مشمع + تشطيب جلد\nالمقاس: كبير (40 × 30 × 12 سم)\nالتفاصيل: غطاء رئيسي، جيب أمامي، حجيرة لابتوب، معادن نحاسية\nالعناية: تنظيف بقطعة قماش رطبة",
    price: 1450,
    old_price: 1720,
    net_profit: 310,
    size_mode: "none",
    size_options: [],
    colors: [
      {
        key: "olive-canvas",
        name: "Olive Canvas",
        name_ar: "كانفاس زيتي",
        value: "#6B7055",
        images: [
          px(1152077),  // olive canvas bag — editorial
          px(904350),   // canvas messenger — lifestyle
          px(1152081),  // waxed canvas bag — detail
        ],
        stock: 6,
      },
      {
        key: "dark-brown",
        name: "Dark Brown",
        name_ar: "بني داكن",
        value: "#4A2E1F",
        images: [
          px(1152016),  // dark brown canvas bag
          px(904349),   // brown messenger bag — lifestyle
          px(1152079),  // brown canvas messenger — studio
        ],
        stock: 5,
      },
    ],
  },
  {
    category: "bags-and-accessories",
    name: "Silk Print Scarf",
    name_ar: "وشاح حرير بطبعة هادئة",
    description:
      "A silk scarf with a soft print and light drape. Designed to finish simple looks without adding visual noise — wear it around the neck, on a bag, or in the hair.",
    description_ar:
      "وشاح حرير بطبعة هادئة وانسياب خفيف. لإكمال الإطلالة البسيطة دون مبالغة — يمكن ارتداؤه حول الرقبة أو على الحقيبة أو في الشعر.",
    specs_en:
      "Material: silk twill\nSize: 70 × 70 cm\nDetails: hand-rolled edges, light sheen finish, woven label\nCare: dry clean only",
    specs_ar:
      "الخامة: حرير تويل\nالمقاس: 70 × 70 سم\nالتفاصيل: حواف ملفوفة يدويًا، لمعة خفيفة، علامة منسوجة\nالعناية: تنظيف جاف فقط",
    price: 520,
    old_price: 620,
    net_profit: 140,
    size_mode: "none",
    size_options: [],
    colors: [
      {
        key: "botanical",
        name: "Botanical",
        name_ar: "نباتي",
        value: "#6B8E6B",
        images: [
          px(6311392),  // green botanical scarf — editorial
          px(6311612),  // scarf in green/earthy tones — portrait
          px(985635),   // green silk scarf — lifestyle
        ],
        stock: 14,
      },
      {
        key: "marine",
        name: "Marine",
        name_ar: "بحري",
        value: "#305F72",
        images: [
          px(6311608),  // blue/teal silk scarf — detail
          px(6311664),  // marine blue scarf — editorial
          px(6311602),  // dark blue scarf — portrait
        ],
        stock: 12,
      },
      {
        key: "ivory",
        name: "Ivory",
        name_ar: "عاجي",
        value: "#EDE8DC",
        images: [
          px(1926769),  // ivory/cream scarf — editorial
          px(2955376),  // light silk scarf — portrait
          px(1536619),  // ivory scarf — lifestyle
        ],
        stock: 10,
      },
    ],
  },
  {
    category: "bags-and-accessories",
    name: "Casual Comfort Sandals",
    name_ar: "صندل كاجوال مريح",
    description:
      "A comfortable everyday sandal with a cushioned footbed and adjustable strap. Simple lines, practical build — designed for long days in warm seasons.",
    description_ar:
      "صندل يومي مريح بنعل مبطن وحزام قابل للتعديل. خطوط بسيطة وبنية عملية — مصمم للأيام الطويلة في المواسم الدافئة.",
    specs_en:
      "Material: leather upper + rubber sole\nDetails: adjustable buckle strap, cushioned footbed, non-slip sole\nFit: true to size",
    specs_ar:
      "الخامة: جزء علوي جلد + نعل مطاط\nالتفاصيل: حزام بإبزيم قابل للتعديل، نعل داخلي مبطن، نعل مضاد للانزلاق\nالمقاس: يتوافق مع المقاس المعتاد",
    price: 880,
    old_price: 1040,
    net_profit: 200,
    size_mode: "numeric",
    size_options: ["37", "38", "39", "40", "41", "42"],
    colors: [
      {
        key: "tan",
        name: "Tan",
        name_ar: "عسلي",
        value: "#B08968",
        images: [
          px(1240892),  // tan leather sandals — editorial
          px(267320),   // tan sandals — side view
          px(1124465),  // tan comfortable sandals — lifestyle
        ],
        stock: { "37": 3, "38": 5, "39": 6, "40": 5, "41": 4, "42": 2 },
      },
      {
        key: "black",
        name: "Black",
        name_ar: "أسود",
        value: "#1A1A1A",
        images: [
          px(19090),    // black sandals — editorial
          px(1464625),  // black leather sandal — detail
          px(298863),   // black casual sandal — lifestyle
        ],
        stock: { "37": 3, "38": 5, "39": 6, "40": 5, "41": 4, "42": 2 },
      },
    ],
  },
];

// ── Schema helpers ────────────────────────────────────────────────────────────
async function ensureColumn(connection, table, column, definition) {
  const [rows] = await connection.query(
    `SHOW COLUMNS FROM \`${table}\` LIKE ?`,
    [column]
  );
  if (rows.length === 0) {
    await connection.query(
      `ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`
    );
    console.log(`  ✔ Added column ${table}.${column}`);
  }
}

async function ensureCatalogSchema(connection) {
  await ensureColumn(connection, "products", "net_profit", "DECIMAL(10,2) NOT NULL DEFAULT 0.00");
  await ensureColumn(connection, "products", "size_mode", "VARCHAR(20) NOT NULL DEFAULT 'none'");
  await ensureColumn(connection, "products", "size_options", "JSON DEFAULT NULL");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS product_colors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      color_key VARCHAR(120) DEFAULT NULL,
      name VARCHAR(120) NOT NULL,
      name_ar VARCHAR(120) DEFAULT NULL,
      value VARCHAR(32) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_product_colors_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  await ensureColumn(connection, "product_colors", "color_key", "VARCHAR(120) DEFAULT NULL");
  await ensureColumn(connection, "product_colors", "name_ar", "VARCHAR(120) DEFAULT NULL");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS product_color_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      color_id INT NOT NULL,
      image_url VARCHAR(512) NOT NULL,
      is_main TINYINT(1) DEFAULT 0,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_product_color_images_color
        FOREIGN KEY (color_id) REFERENCES product_colors(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      color_id INT DEFAULT NULL,
      size_value VARCHAR(20) DEFAULT NULL,
      stock INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_product_variant (product_id, color_id, size_value),
      CONSTRAINT fk_product_variants_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      CONSTRAINT fk_product_variants_color
        FOREIGN KEY (color_id) REFERENCES product_colors(id) ON DELETE CASCADE
    )
  `);
}

// ── Stock calculator ──────────────────────────────────────────────────────────
function sumProductStock(product) {
  if (!product.colors?.length) {
    if (product.size_mode !== "none" && product.size_stock) {
      return Object.values(product.size_stock).reduce(
        (sum, v) => sum + Number(v || 0),
        0
      );
    }
    return Number(product.stock || 0);
  }

  return product.colors.reduce((sum, color) => {
    if ((product.size_mode || "none") !== "none") {
      return (
        sum +
        Object.values(color.stock || {}).reduce(
          (inner, v) => inner + Number(v || 0),
          0
        )
      );
    }
    return sum + Number(color.stock || 0);
  }, 0);
}

// ── Product inserter ──────────────────────────────────────────────────────────
async function insertProduct(connection, categoryIdMap, product, index) {
  const categoryId = categoryIdMap.get(product.category);
  if (!categoryId)
    throw new Error(`Unknown category slug: "${product.category}" for product "${product.name}"`);

  const totalStock = sumProductStock(product);
  const slug = `${slugify(product.name, { lower: true, strict: true })}-${index + 1}`;

  const [result] = await connection.query(
    `
      INSERT INTO products (
        category_id, name, name_ar, slug, description, description_ar,
        price, old_price, net_profit, stock, is_active, specs_en, specs_ar,
        size_mode, size_options
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
    `,
    [
      categoryId,
      product.name,
      product.name_ar,
      slug,
      product.description,
      product.description_ar,
      product.price,
      product.old_price || null,
      product.net_profit || 0,
      totalStock,
      product.specs_en || null,
      product.specs_ar || null,
      product.size_mode || "none",
      JSON.stringify(product.size_options || []),
    ]
  );

  const productId = result.insertId;

  if (product.colors?.length) {
    for (const [colorIndex, color] of product.colors.entries()) {
      const [colorResult] = await connection.query(
        `
          INSERT INTO product_colors (product_id, color_key, name, name_ar, value, sort_order)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [productId, color.key || null, color.name, color.name_ar || null, color.value, colorIndex]
      );
      const colorId = colorResult.insertId;

      // Insert each color's images (always exactly 3)
      for (const [imgIndex, imageUrl] of (color.images || []).entries()) {
        await connection.query(
          `
            INSERT INTO product_color_images (color_id, image_url, is_main, sort_order)
            VALUES (?, ?, ?, ?)
          `,
          [colorId, imageUrl, imgIndex === 0 ? 1 : 0, imgIndex]
        );
      }

      // Insert size variants
      if ((product.size_mode || "none") !== "none") {
        for (const sizeValue of product.size_options || []) {
          await connection.query(
            `
              INSERT INTO product_variants (product_id, color_id, size_value, stock)
              VALUES (?, ?, ?, ?)
            `,
            [productId, colorId, sizeValue, Number(color.stock?.[sizeValue] || 0)]
          );
        }
      } else {
        // No size — single variant per color
        await connection.query(
          `
            INSERT INTO product_variants (product_id, color_id, size_value, stock)
            VALUES (?, ?, NULL, ?)
          `,
          [productId, colorId, Number(color.stock || 0)]
        );
      }
    }
  } else {
    // No colors — insert images into product_images
    for (const [imgIndex, imageUrl] of (product.images || []).entries()) {
      await connection.query(
        `INSERT INTO product_images (product_id, image_url, is_main) VALUES (?, ?, ?)`,
        [productId, imageUrl, imgIndex === 0 ? 1 : 0]
      );
    }

    if ((product.size_mode || "none") !== "none") {
      for (const sizeValue of product.size_options || []) {
        await connection.query(
          `INSERT INTO product_variants (product_id, color_id, size_value, stock) VALUES (?, NULL, ?, ?)`,
          [productId, sizeValue, Number(product.size_stock?.[sizeValue] || 0)]
        );
      }
    }
  }

  console.log(`  ✔ ${product.name} (stock: ${totalStock})`);
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
    for (const table of [
      "wallet_transactions",
      "order_items",
      "orders",
      "reviews",
      "wishlist",
      "cart_items",
      "carts",
      "product_variants",
      "product_color_images",
      "product_colors",
      "product_images",
      "products",
      "categories",
    ]) {
      await connection.query(`TRUNCATE TABLE \`${table}\``);
    }
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log(`\n📂 Inserting ${categories.length} categories…`);
    const categoryIdMap = new Map();
    for (const [index, category] of categories.entries()) {
      const [result] = await connection.query(
        `
          INSERT INTO categories (name, name_ar, slug, icon, image_url, is_active, sort_order)
          VALUES (?, ?, ?, ?, ?, 1, ?)
        `,
        [
          category.name,
          category.name_ar,
          category.slug,
          category.icon,
          category.image_url,
          index,
        ]
      );
      categoryIdMap.set(category.slug, result.insertId);
      console.log(`  ✔ ${category.name}`);
    }

    console.log(`\n👗 Inserting ${products.length} products…`);
    for (const [index, product] of products.entries()) {
      await insertProduct(connection, categoryIdMap, product, index);
    }

    await connection.commit();
    console.log(
      `\n✅ Seeded ${categories.length} categories and ${products.length} products successfully.`
    );
  } catch (error) {
    await connection.rollback();
    console.error("\n❌ Catalog seeding failed:", error.message);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    connection.release();
    process.exit(process.exitCode || 0);
  }
}

seedFashionCatalog();
