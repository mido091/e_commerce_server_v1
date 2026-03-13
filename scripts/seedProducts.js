import db from "../config/db.js";
import slugify from "slugify";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Ensure .env is loaded
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const unsplash = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=800`;

const categories = [
  { id: 1, name: "Fashion & Apparel", name_ar: "الأزياء والملابس", icon: "shirt", image_url: unsplash("1441986300917-64674bd600d8") },
  { id: 2, name: "Electronics & Gadgets", name_ar: "الإلكترونيات والأجهزة", icon: "smartphone", image_url: unsplash("1498049794561-7780e7231661") },
  { id: 3, name: "Home Decor", name_ar: "ديكور المنزل", icon: "home", image_url: unsplash("1484154218962-a197022b5858") },
  { id: 4, name: "Beauty & Personal Care", name_ar: "الجمال والعناية الشخصية", icon: "sparkles", image_url: unsplash("1596461404969-9ae70f2830c1") },
  { id: 5, name: "Sports & Fitness", name_ar: "الرياضة واللياقة البدنية", icon: "activity", image_url: unsplash("1517836357463-d25dfeac3438") },
  { id: 6, name: "Watches & Accessories", name_ar: "الساعات والإكسسوارات", icon: "watch", image_url: unsplash("1524592094714-0f0654e20314") },
];

const products = [
  // --- FASHION & APPAREL (1-10) ---
  {
    category_id: 1,
    name_en: "Midnight Velvet Evening Gown",
    name_ar: "فستان سهرة مخملي بلون منتصف الليل",
    desc_en: "Exude elegance in this luxurious midnight blue velvet gown, featuring a sophisticated floor-length silhouette. Perfect for high-end galas and exclusive evening events where making a statement is mandatory. Crafted from premium silk-blend velvet for a soft, shimmering finish.",
    desc_ar: "تألقي بأناقة لا مثيل لها مع هذا الفستان المخملي الفاخر بلون أزرق منتصف الليل، والذي يتميز بقصة طويلة وراقية. مثالي للحفلات الفاخرة والمناسبات المسائية الحصرية حيث يكون التميز أمراً ضرورياً. مصنوع من المخمل المميز الممزوج بالحرير لملمس ناعم وبريق ساحر.",
    price: 450.00,
    stock: 25,
    images: [
      unsplash("1539008835657-9e8e9680c956"),
      unsplash("1515372039744-b8f02a3ae446"),
      unsplash("1490481651871-ab68de25d43d"),
      unsplash("1566174053879-31528523f8ae")
    ]
  },
  {
    category_id: 1,
    name_en: "Hand-Tailored Italian Wool Suit",
    name_ar: "بدلة صوف إيطالية مفصلة يدوياً",
    desc_en: "A masterpiece of sartorial excellence, this suit is hand-tailored from the finest 150s Italian wool. Featuring a slim-fit cut and notched lapels, it defines modern professional luxury. Ideal for high-stakes business meetings and prestigious formal occasions.",
    desc_ar: "شاهكار من التميز في الخياطة، هذه البدلة مفصلة يدوياً من أجود أنواع الصوف الإيطالي عيار 150. تتميز بقصة ضيقة وطيات صدر مدببة، مما يحدد الفخامة المهنية الحديثة. مثالية لاجتماعات العمل رفيعة المستوى والمناسبات الرسمية المرموقة.",
    price: 850.00,
    stock: 15,
    images: [
      unsplash("1594932224010-756643c71df5"),
      unsplash("1507679799987-c7377ec486b8"),
      unsplash("1485333127393-279fd3f6b412"),
      unsplash("1593032465175-481ac7f401bd")
    ]
  },
  {
    category_id: 1,
    name_en: "Pure Cashmere Cable-Knit Sweater",
    name_ar: "سترة كشمير خالص بضفائر",
    desc_en: "Indulge in the ultimate warmth and softness of 100% pure Grade-A Mongolian cashmere. This heavy-weight cable-knit sweater features a classic crew neck and ribbed cuffs, offering a timeless aesthetic that is both cozy and refined.",
    desc_ar: "استمتع بالدفء والنعومة الفائقة للكشمير المنغولي الخالص بنسبة 100٪ من الفئة (أ). تتميز هذه السترة الثقيلة المنسوجة بضفائر بفتحة رقبة مستديرة كلاسيكية وأطراف أكمام مضلعة، مما يوفر جمالية خالدة مريحة وراقية في آن واحد.",
    price: 320.00,
    stock: 20,
    images: [
      unsplash("1574167132712-23ca79116e16"),
      unsplash("1434389677669-e08b4171096d"),
      unsplash("1551048632-24e2373578a4"),
      unsplash("1556905055-8f358a7a47b2")
    ]
  },
  {
    category_id: 1,
    name_en: "Urban Nomad Distressed Leather Jacket",
    name_ar: "جاكيت جلد 'أوربان نوماد' بتصميم معتق",
    desc_en: "Crafted from rugged, full-grain buffalo leather, this jacket embodies a spirit of adventure and urban edge. Featuring hand-distressed detailing and custom antique brass hardware, it develops a unique patina with every wear for a truly personalized look.",
    desc_ar: "مصنوع من جلد الجاموس المتين عالي الجودة، هذا الجاكيت يجسد روح المغامرة والحدة الحضرية. يتميز بتفاصيل معتقة يدوياً وقطع معدنية من النحاس العتيق المخصص، ويكتسب بمرور الوقت مظهراً فريداً مع كل استخدام لمظهر شخصي حقاً.",
    price: 580.00,
    stock: 12,
    images: [
      unsplash("1551028719-00167b16eac5"),
      unsplash("1520975916090-3105956dac54"),
      unsplash("1428911723447-02450db0211a"),
      unsplash("1441742917377-57f78ee0e582")
    ]
  },
  {
    category_id: 1,
    name_en: "Bohemian Rhapsody Silk Maxi Dress",
    name_ar: "فستان ماكسي حريري 'بوهيميان رابسودي'",
    desc_en: "Flow through your day with this ethereal maxi dress, crafted from 100% pure silk chiffon. Featuring a vibrant artisanal floral print and a romantic tiered skirt, it captures the essence of refined bohemian luxury and effortless grace.",
    desc_ar: "تألقي طوال يومك مع هذا الفستان الماكسي الانسيابي، المصنوع من شيفون الحرير الخالص بنسبة 100٪. يتميز بطبعة زهور حرفية مفعمة بالحيوية وتنورة رومانسية متعددة الطبقات، مما يجسد جوهر الفخامة البوهيمية الراقية والنعومة السهلة.",
    price: 395.00,
    stock: 18,
    images: [
      unsplash("1496747611176-843222e1e57c"),
      unsplash("1572804013309-59a88b7e92f1"),
      unsplash("1581044777550-4cfa60707c03"),
      unsplash("1518881133107-d319acc61f3a")
    ]
  },
  {
    category_id: 1,
    name_en: "Oxford Elite Tailored Button-Down",
    name_ar: "قميص أكسفورد إيليت مفصل",
    desc_en: "Redefine your professional wardrobe with this premium Oxford shirt, woven from high-thread-count Egyptian cotton. Featuring a precise tailored fit and a crisp button-down collar, it provides a sharp, commanding presence for the boardroom and beyond.",
    desc_ar: "أعد تعريف خزانة ملابسك المهنية مع قميص أكسفورد الفاخر هذا، المنسوج من القطن المصري عالي الجودة. يتميز بقصة مفصلة دقيقة وياقة بأزرار متينة، مما يمنحك حضوراً حاداً وواثقاً في غرفة الاجتماعات وما بعدها.",
    price: 145.00,
    stock: 50,
    images: [
      unsplash("1596755094514-f87e34085b2c"),
      unsplash("1602810318383-e386cc2a3ccf"),
      unsplash("1603252109303-2751441dd157"),
      unsplash("1581655353564-df123a1ec12e")
    ]
  },
  {
    category_id: 1,
    name_en: "Noir High-Waisted Sculpting Trousers",
    name_ar: "بنطلون أسود بخصر عالٍ لنحت القوام",
    desc_en: "Engineered for a flawless silhouette, these high-waisted trousers are crafted from a premium stretch-wool blend. Featuring strategic sculpting seams and a chic wide-leg cut, they offer a sophisticated balance of comfort and high-fashion aesthetic.",
    desc_ar: "مصمم للحصول على قوام مثالي، هذا البنطلون ذو الخصر العالي مصنوع من مزيج صوف مطاطي فاخر. يتميز بخياطة استراتيجية لنحت القوام وقصة واسعة الساق أنيقة، مما يوفر توازناً راقياً بين الراحة وجمالية الموضة الراقية.",
    price: 210.00,
    stock: 30,
    images: [
      unsplash("1594633312681-425c7b97ccd1"),
      unsplash("1506629082955-511b1aa562c8"),
      unsplash("1582533561751-ef6f6ab93a2e"),
      unsplash("1475180098004-ca77a66827be")
    ]
  },
  {
    category_id: 1,
    name_en: "Artisan Silk Scarf in Botanical Gold",
    name_ar: "وشاح حريري حرفي بنقشة ذهبية نباتية",
    desc_en: "Add a layer of radiant elegance to your look with this hand-finished silk scarf. Featuring an intricate botanical print in burnished gold and midnight blue, it is meticulously crafted from the finest grade mulberry silk for a delicate, luminous sheen.",
    desc_ar: "أضف طبقة من الأناقة المشعة إلى مظهرك مع هذا الوشاح الحريري المشغول يدوياً. يتميز بطبعة نباتية معقدة باللون الذهبي المصقول والأزرق الداكن، وهو مصنوع بدقة من أجود أنواع حرير التوت للمسة ناعمة وبريق مضيء.",
    price: 165.00,
    stock: 40,
    images: [
      unsplash("1583337130417-3346a1be7dee"),
      unsplash("1515886657613-9f3515b0c78f"),
      unsplash("1496747611176-843222e1e57c"),
      unsplash("1475180098004-ca77a66827be")
    ]
  },
  {
    category_id: 1,
    name_en: "Sculpted Fit Selvedge Denim Jeans",
    name_ar: "بنطلون جينز 'سيلفيدج' بقصة منحوتة",
    desc_en: "Experience the pinnacle of denim craftsmanship with these selvedge jeans, woven on traditional shuttle looms. Featuring a tailored sculpted fit and a rich indigo wash, they are designed to age beautifully and provide a lifetime of rugged, stylish wear.",
    desc_ar: "اختبر قمة الحرفية في عالم الجينز مع بنطلون 'سيلفيدج' المنسوج على أنوال تقليدية. يتميز بقصة مفصلة منحوتة وغسلة إنديجو غنية، وهي مصممة لتصبح أكثر جمالاً مع مرور الوقت وتوفر استخداماً متيناً وأنيقاً طوال العمر.",
    price: 195.00,
    stock: 45,
    images: [
      unsplash("1541099649105-f69ad21f3246"),
      unsplash("1542272604-787c3835535d"),
      unsplash("1582552938384-a021d72ba4a5"),
      unsplash("1604176354204-926873ff3da9")
    ]
  },
  {
    category_id: 1,
    name_en: "Heritage Double-Breasted Trench Coat",
    name_ar: "معطف ترنش كلاسيكي بصفين من الأزرار",
    desc_en: "This iconic double-breasted trench coat is a testament to timeless style. Crafted from water-resistant cotton gabardine and featuring authentic military-inspired details, it provides sophisticated protection from the elements while ensuring a sharp, elegant silhouette.",
    desc_ar: "هذا المعطف الشهير بصفين من الأزرار هو شهادة على الأسلوب الخالد. مصنوع من غابردين القطن المقاوم للماء ويتميز بتفاصيل أصلية مستوحاة من الطابع العسكري، مما يوفر حماية راقية من العوامل الجوية مع ضمان قوام حاد وأنيق.",
    price: 650.00,
    stock: 10,
    images: [
      unsplash("1591047139829-d91aecb6caea"),
      unsplash("1544022613-e87ca75a784a"),
      unsplash("1580664716677-2c86e3f92b33"),
      unsplash("1551488831-00ddcb6c6bd3")
    ]
  },

  // --- ELECTRONICS & GADGETS (11-20) ---
  {
    category_id: 2,
    name_en: "Pro-Stream RGB Mechanical Keyboard",
    name_ar: "لوحة مفاتيح ميكانيكية 'بروستريم' بإضاءة RGB",
    desc_en: "Elevate your performance with this precision-engineered mechanical keyboard, featuring ultra-responsive tactile switches. With fully customizable per-key RGB lighting and a durable aircraft-grade aluminum frame, it is built for both competitive gaming and high-speed professional typing.",
    desc_ar: "ارتقِ بأدائك مع لوحة المفاتيح الميكانيكية المصممة بدقة، والتي تتميز بمفاتيح لمسية فائقة الاستجابة. مع إضاءة RGB قابلة للتخصيص بالكامل لكل مفتاح وإطار متين من الألومنيوم المستخدم في صناعة الطائرات، فهي مصممة للألعاب التنافسية والكتابة المهنية عالية السرعة.",
    price: 185.00,
    stock: 40,
    images: [
      unsplash("1511467687858-23d96c32e4ae"),
      unsplash("1587829741301-379eb00193b7"),
      unsplash("1593305841991-05c297ba4355"),
      unsplash("1618335829737-2228915674e0")
    ]
  },
  {
    category_id: 2,
    name_en: "Ultra-Wide 4K Curved Studio Monitor",
    name_ar: "شاشة استوديو 4K منحنية فائقة الاتساع",
    desc_en: "Immerse yourself in stunning detail with this 49-inch ultra-wide 4K curved monitor. Featuring professional-grade color accuracy (99% sRGB) and an expansive panoramic view, it is the ultimate canvas for creative professionals, video editors, and power users seeking maximum productivity.",
    desc_ar: "انغمس في تفاصيل مذهلة مع هذه الشاشة المنحنية فائقة الاتساع مقاس 49 بوصة بدقة 4K. تتميز بدقة ألوان احترافية (99% sRGB) ورؤية بانورامية واسعة، وهي اللوحة المثالية للمحترفين المبدعين ومحرري الفيديو والمستخدمين الباحثين عن أقصى قدر من الإنتاجية.",
    price: 1250.00,
    stock: 15,
    images: [
      unsplash("1527443224154-c4a3c42d349c"),
      unsplash("1551645120-d70bfe8d980f"),
      unsplash("1547115941-07d0d9ce28c4"),
      unsplash("1515341392367-5840a3b940bb")
    ]
  },
  {
    category_id: 2,
    name_en: "Sonic-Blast Active Noise Cancelling Earbuds",
    name_ar: "سماعات أذن 'سونيك بلاست' بخاصية إلغاء الضوضاء",
    desc_en: "Experience pure audio bliss with the Sonic-Blast earbuds, featuring advanced hybrid active noise cancellation and custom-tuned high-fidelity drivers. With up to 30 hours of battery life and a sleek, ergonomic design, they deliver crystal-clear sound and all-day comfort for your commute and workouts.",
    desc_ar: "اختبر متعة صوتية خالصة مع سماعات 'سونيك بلاست'، التي تتميز بخاصية إلغاء الضوضاء النشطة الهجينة المتقدمة ومكبرات صوت عالية الدقة مضبوطة بدقة. مع عمر بطارية يصل إلى 30 ساعة وتصميم أنيق ومريح، توفر صوتاً نقياً وراحة طوال اليوم لتنقلاتك وتمارينك.",
    price: 240.00,
    stock: 65,
    images: [
      unsplash("1590658268037-6bf12165a8df"),
      unsplash("1606220588913-b3aacb4d2f46"),
      unsplash("1583334838336-acd977736f90"),
      unsplash("1505740420928-5e560c06d30e")
    ]
  },
  {
    category_id: 2,
    name_en: "Zen-Core Biometric Meditation Headband",
    name_ar: "عصابة رأس 'زين-كور' للبيومترية والتأمل",
    desc_en: "Unlock the secrets of your mind with the Zen-Core headband, which uses advanced EEG sensors to monitor your brain activity during meditation. Connects to your mobile app to provide real-time feedback and detailed analytics, helping you achieve deeper states of relaxation and mindfulness more effectively.",
    desc_ar: "اكتشف أسرار عقلك مع عصابة رأس 'زين-كور' التي تستخدم مستشعرات EEG متقدمة لمراقبة نشاط دماغك أثناء التأمل. تتصل بتطبيق هاتفك لتقديم ملاحظات فورية وتحليلات مفصلة، مما يساعدك على الوصول لحالات أعمق من الاسترخاء والوعي بشكل أكثر فعالية.",
    price: 295.00,
    stock: 25,
    images: [
      unsplash("1506126613408-eca07ce68773"),
      unsplash("1528715471579-d1bcf0ba5e83"),
      unsplash("1545240681-4143d2606869"),
      unsplash("1601050630560-f8ca7f4a270f")
    ]
  },
  {
    category_id: 2,
    name_en: "Titan-X Precision Gaming Mouse",
    name_ar: "ماوس الألعاب 'تايتان-إكس' فائق الدقة",
    desc_en: "Master your gameplay with the Titan-X, featuring a state-of-the-art 26,000 DPI optical sensor for lightning-fast tracking and pixel-perfect accuracy. With adjustable weight systems and 11 programmable buttons, it is fully customizable to suit your unique playstyle and handle the most intense sessions.",
    desc_ar: "سيطر على لعبك مع 'تايتان-إكس'، الذي يتميز بمستشعر بصري متطور بدقة 26,000 DPI لتتبع سريع كالبرق ودقة مثالية. مع أنظمة وزن قابلة للتعديل و11 زراً قابلاً للبرمجة، فهي قابلة للتخصيص بالكامل لتناسب أسلوب لعبك الفريد وتتحمل أصعب الجلسات.",
    price: 115.00,
    stock: 80,
    images: [
      unsplash("1615663245857-9937839db67e"),
      unsplash("1527864550417-7fd91fc51a46"),
      unsplash("1593305841991-05c297ba4355"),
      unsplash("1605773527852-c546a8584ea3")
    ]
  },
  {
    category_id: 2,
    name_en: "Aero-Light Carbon Fiber Laptop Stand",
    name_ar: "حامل لابتوب 'إيرو-لايت' من ألياف الكربون",
    desc_en: "Optimize your ergonomic workspace with this ultra-lightweight carbon fiber laptop stand. Featuring a foldable, portable design and multiple height adjustments, it provides the perfect viewing angle while ensuring maximum cooling airflow for your high-performance laptop.",
    desc_ar: "حسّن مريحات مكان عملك مع حامل اللابتوب المصنوع من ألياف الكربون خفيف الوزن للغاية. يتميز بتصميم قابل للطي ومحمول وتعديلات متعددة للارتفاع، مما يوفر زاوية رؤية مثالية مع ضمان أقصى قدر من تدفق هواء التبريد لجهاز اللابتوب عالي الأداء الخاص بك.",
    price: 85.00,
    stock: 120,
    images: [
      unsplash("1544006659-f0b21f04cb1d"),
      unsplash("1527864550417-7fd91fc51a46"),
      unsplash("1586210579191-33b45e38fa2c"),
      unsplash("1574944966950-8164c24446c6")
    ]
  },
  {
    category_id: 2,
    name_en: "Prism-Link Gigabit Smart Router",
    name_ar: "راوتر 'بريزم-لينك' ذكي بجيجابايت",
    desc_en: "Ensure seamless connectivity throughout your smart home with the Prism-Link router. Featuring tri-band Wi-Fi 6 technology and advanced security protocols, it provides ultra-fast speeds and reliable coverage for all your connected devices simultaneously.",
    desc_ar: "اضمن اتصالاً سلساً في جميع أنحاء منزلك الذكي مع راوتر 'بريزم-لينك'. يتميز بتقنية Wi-Fi 6 ثلاثية النطاق وبروتوكولات أمان متقدمة، ويوفر سرعات فائقة وتغطية موثوقة لجميع أجهزتك المتصلة في وقت واحد.",
    price: 325.00,
    stock: 20,
    images: [
      unsplash("1544197150-b99a580bb7a8"),
      unsplash("1558494949-ef010cbdcc51"),
      unsplash("1600132806370-bf17e65e942f"),
      unsplash("1563770660941-20978e87081b")
    ]
  },
  {
    category_id: 2,
    name_en: "Nova-Charge Solar-Powered Power Bank",
    name_ar: "شاحن متنقل 'نوفا-تشارج' بالطاقة الشمسية",
    desc_en: "Never run out of power on your adventures with this 20,000mAh solar-powered power bank. Rugged, waterproof, and equipped with a high-efficiency solar panel, it provides reliable off-grid charging for your essential devices in the most demanding environments.",
    desc_ar: "لا تنفد الطاقة أبداً خلال مغامراتك مع هذا الشاحن المتنقل بسعة 20,000 مللي أمبير الذي يعمل بالطاقة الشمسية. متين ومقاوم للماء ومزود بلوحة شمسية عالية الكفاءة، ويوفر شحناً موثوقاً بعيداً عن الشبكة لأجهزتك الأساسية في أصعب البيئات.",
    price: 95.00,
    stock: 50,
    images: [
      unsplash("1509391366360-fe58f967be76"),
      unsplash("1504222490345-c075b6008014"),
      unsplash("1621330396173-e41b1bac717f"),
      unsplash("1593941707882-a5bba14938c7")
    ]
  },
  {
    category_id: 2,
    name_en: "Vector-Draw Pro Wireless Graphics Tablet",
    name_ar: "تابلت رسم لاسلكي 'فيكتور-درو برو'",
    desc_en: "unleash your creativity with this professional-grade wireless graphics tablet. Featuring 8,192 levels of pressure sensitivity and a paper-like surface texture, it provides a natural drawing experience for digital artists, designers, and photo retouchers.",
    desc_ar: "أطلق العنان لإبداعك مع تابلت الرسم اللاسلكي من الفئة الاحترافية. يتميز بـ 8,192 مستوى من حساسية الضغط وملمس سطح يشبه الورق، ويوفر تجربة رسم طبيعية للفنانين الرقميين والمصممين ومحرري الصور.",
    price: 380.00,
    stock: 15,
    images: [
      unsplash("1587653263995-422546a7c568"),
      unsplash("1564862376606-29a8ac44ccdd"),
      unsplash("1516321497487-e288fb19713f"),
      unsplash("1585241936939-be4099591252")
    ]
  },
  {
    category_id: 2,
    name_en: "Stealth-Voice USB Condenser Microphone",
    name_ar: "ميكروفون 'ستيلث-فويس' بمكثف USB",
    desc_en: "Capture studio-quality audio for your podcasts, streams, and professional calls with this USB condenser microphone. Featuring a cardioid pickup pattern and a built-in pop filter, it delivers rich, clear sound while minimizing background noise for a professional presence.",
    desc_ar: "سجل صوتاً بجودة الاستوديو لبودكاستك وبثك ومكالماتك المهنية مع هذا الميكروفون المكثف الذي يعمل بـ USB. يتميز بنمط التقاط قلبي وفلتر مدمج لتقليل الضوضاء، ويوفر صوتاً غنياً ونقياً مع تقليل ضوضاء الخلفية لحضور مهني.",
    price: 155.00,
    stock: 35,
    images: [
      unsplash("1590602847861-f357a9332bbc"),
      unsplash("1589903308914-df2d02ac796b"),
      unsplash("1524230612046-e717e305373a"),
      unsplash("1516280440614-37939bbacd81")
    ]
  },

  // --- HOME DECOR (21-30) ---
  {
    category_id: 3,
    name_en: "Mid-Century Modern Oak Credenza",
    name_ar: "خزانة جانبية من البلوط بتصميم منتصف القرن",
    desc_en: "Elevate your living space with this iconic mid-century modern credenza, handcrafted from solid European white oak. Featuring minimalist clean lines and ample storage space, it seamlessly blends timeless retro aesthetics with modern functional luxury.",
    desc_ar: "ارتقِ بمساحة معيشتك مع هذه الخزانة الجانبية الأيقونية بتصميم منتصف القرن الحديث، والمصنوعة يدوياً من خشب البلوط الأبيض الأوروبي الصلب. تتميز بخطوط بسيطة ونظيفة ومساحة تخزين واسعة، وتجمع بسلاسة بين الجماليات العتيقة الخالدة والوظائف الحديثة الفاخرة.",
    price: 1450.00,
    stock: 8,
    images: [
      unsplash("1538688423619-a81d3f23454b"),
      unsplash("1533090161767-e6ffed986c88"),
      unsplash("1583847268964-b28dc8f51f92"),
      unsplash("1595428774223-ef52624120d2")
    ]
  },
  {
    category_id: 3,
    name_en: "Velvet Tufted Statement Sofa",
    name_ar: "كنبة مخملية فاخرة بأزرار",
    desc_en: "Make a bold statement with this luxurious velvet tufted sofa, featuring deep diamond quilting and sleek brass-finished legs. The high-density foam cushioning and premium stain-resistant velvet provide unparalleled comfort and a sophisticated, high-end feel for your home.",
    desc_ar: "أضف لمسة جريئة مع هذه الكنبة المخملية الفاخرة، التي تتميز بتقطیع الماسي العميق وأرجل أنيقة مطلية بالنحاس. توفر وسائد الإسفنج عالية الكثافة والمخمل الفاخر المقاوم للبقع راحة لا ميل لها وشعوراً راقياً وفخماً لمنزلك.",
    price: 2800.00,
    stock: 5,
    images: [
      unsplash("1555041469-a586c61ea9bc"),
      unsplash("1493663284031-b7e3aefcae8e"),
      unsplash("1484101403033-5710502d671a"),
      unsplash("1540574163026-643ea20ade25")
    ]
  },
  {
    category_id: 3,
    name_en: "Geometric Hand-Woven Wool Rug",
    name_ar: "سجادة صوف منسوجة يدوياً بنمط هندسي",
    desc_en: "Add texture and modern artistry to your floors with this artisanal geometric wool rug. Hand-woven by skilled traditional craftsmen, the intricate monochrome pattern and plush pile offer a sophisticated foundation for any contemporary interior space.",
    desc_ar: "أضف ملمساً وفناً عصرية لأرضياتك مع هذه السجادة الصوفية الهندسية الحرفية. منسوجة يدوياً من قبل حرفيين تقليديين مهارة، ويوفر النمط المعقد بالأبيض والأسود والوبر الكثيف أساساً راقياً لأي مساحة داخلية معاصرة.",
    price: 550.00,
    stock: 12,
    images: [
      unsplash("1575414003591-ece8d0416c7a"),
      unsplash("1534889156217-d3c8ef4ca310"),
      unsplash("1531835673351-4773c54c8a0a"),
      unsplash("1562411052-012d46e30b44")
    ]
  },
  {
    category_id: 3,
    name_en: "Minimalist Arc Brushed Steel Floor Lamp",
    name_ar: "أباجورة أرضية معدنية منحنية بسيطة",
    desc_en: "Illuminate your interior with sophisticated grace using this minimalist arc floor lamp. Featuring a sleek brushed steel frame and a weighted marble base, its elegant silhouette provides ambient lighting and a touch of modern architectural style to any room.",
    desc_ar: "أنر منزلك بنعومة راقية باستخدام هذه الأباجورة الأرضية المنحنية البسيطة. تتميز بإطار من الصلب المصقول وقاعدة رخامية ثقيلة، ويوفر شكلها الأنيق إضاءة محيطة ولمسة من الطراز المعماري الحديث لأي غرفة.",
    price: 340.00,
    stock: 25,
    images: [
      unsplash("1507473885765-e6ed6570b5a1"),
      unsplash("1534073828943-f801091bb18c"),
      unsplash("1513506496266-aa6c379532bb"),
      unsplash("1524758631624-e2822e304c36")
    ]
  },
  {
    category_id: 3,
    name_en: "Abstract Expressionist Large Canvas Art",
    name_ar: "لوحة كانفاس كبيرة للفن التعبيري التجريدي",
    desc_en: "Transform your walls into a gallery with this captivating large-scale abstract canvas. Featuring a dynamic layering of textures and a sophisticated color palette, it serves as a stunning focal point that invites contemplation and adds artistic depth to your living space.",
    desc_ar: "حول جدرانك إلى معرض فني مع هذه اللوحة التجريدية الكبيرة والساحرة. تتميز بطبقات ديناميكية من الملامس ولوحة ألوان راقية، وتعتبر نقطة محورية مذهلة تدعو للتأمل وتضيف عمقاً فنياً لمساحة معيشتك.",
    price: 850.00,
    stock: 10,
    images: [
      unsplash("1541963463532-d68292c34b19"),
      unsplash("1579783902614-a3fb3927b6a5"),
      unsplash("1549490349-8643362247b5"),
      unsplash("1543857778-c4a1a3e0b2eb")
    ]
  },
  {
    category_id: 3,
    name_en: "Ceramic Stoneware 24-Piece Dinner Set",
    name_ar: "طقم سفرة سيراميك مكون من 24 قطعة",
    desc_en: "Dine in artisanal style with this 24-piece ceramic stoneware dinner set, featuring a unique matte speckled glaze. Each piece is hand-finished to ensure organic variations, offering a sophisticated and earthy aesthetic for both everyday meals and special gatherings.",
    desc_ar: "تناول طعامك بأسلوب حرفي مع طقم السيراميك المكون من 24 قطعة، والذي يتميز بطلاء مطفي مرقط فريد. تم صقل كل قطعة يدوياً لضمان الاختلافات الطبيعية، مما يوفر جمالية راقية وطبيعية للوجبات اليومية والمناسبات الخاصة.",
    price: 480.00,
    stock: 15,
    images: [
      unsplash("1574362848149-11496d03a7c7"),
      unsplash("1610701596007-115027375f4b"),
      unsplash("1590089405021-93e8da46e50e"),
      unsplash("1582268611958-ebba1e50529d")
    ]
  },
  {
    category_id: 3,
    name_en: "Floating Walnut Structured Shelving Unit",
    name_ar: "وحدة أرفف معلقة من خشب الجوز",
    desc_en: "Organize your curated items with this minimalist floating shelving unit, crafted from premium sustainable walnut. The invisible mounting system and staggered structured design provide a clean, modern aesthetic that maximizes your vertical wall space with high-end style.",
    desc_ar: "نظم مقتنياتك مع وحدة الأرفف المعلقة البسيطة هذه، المصنوعة من خشب الجوز المستدام الفاخر. يوفر نظام التثبيت الخفي والتصميم المتدرج جمالية نظيفة وعصرية تزيد من مساحة الحائط الرأسية بأسلوب راقٍ.",
    price: 360.00,
    stock: 20,
    images: [
      unsplash("1594620302200-9a762244a156"),
      unsplash("1466781783364-39c9a89b2708"),
      unsplash("1519710164239-da123dc03ef4"),
      unsplash("1554995207-c18c20360a59")
    ]
  },
  {
    category_id: 3,
    name_en: "Copper-Infused Hand-Blown Glass Decanter",
    name_ar: "دورق زجاجي منفوخ يدوياً مع ذرات النحاس",
    desc_en: "Serve your finest spirits in this exquisite hand-blown glass decanter, featuring subtle copper-infused detailing. The unique organic form and precision-cut crystal stopper combine traditional craftsmanship with a contemporary luxury aesthetic for your bar collection.",
    desc_ar: "قدم مشروباتك المفضلة في هذا الدورق الزجاجي المنفوخ يدوياً الرائع، الذي يتميز بتفاصيل دقيقة من النحاس. يجمع الشكل الطبيعي الفريد والغطاء الكريستالي المقطوع بدقة بين الحرفية التقليدية وجمالية الفخامة المعاصرة لمجموعة أدوات منزلك.",
    price: 240.00,
    stock: 30,
    images: [
      unsplash("1510076857177-74701a0a5baf"),
      unsplash("1581006852262-e4307cf6283a"),
      unsplash("1514362545857-3bc16c4c7d1b"),
      unsplash("1568644833215-46f345330e70")
    ]
  },
  {
    category_id: 3,
    name_en: "Hand-Blown Murano Style Art Glass Vase",
    name_ar: "فازة زجاجية فنية بطراز 'مورانو'",
    desc_en: "Add a splash of vibrant color and artistic flair to your décor with this hand-blown art glass vase. Inspired by classical Murano techniques, each vase features a unique swirl of colors and an elegant, fluid form that serves as a beautiful standalone sculpture or a floral vessel.",
    desc_ar: "أضف لمسة من الألوان الحيوية والذوق الفني لديكورك مع هذه الفازة الزجاجية الفنية المنفوخة يدوياً. مستوحاة من تقنيات 'مورانو' الكلاسيكية، تتميز كل فازة بدوامة فريدة من الألوان وشكل انسيابي وأنيق يعمل كتمثال مستقل جميل أو كوعاء للزهور.",
    price: 185.00,
    stock: 25,
    images: [
      unsplash("1581783898377-1c85bc937427"),
      unsplash("1598948484402-9ecc9ac7906d"),
      unsplash("1596162954151-cdcb4c0f70a9"),
      unsplash("1516641396056-0ce60a359341")
    ]
  },
  {
    category_id: 3,
    name_en: "Sculptural Teak Root Coffee Table",
    name_ar: "طاولة قهوة من جذور خشب التيك المنحوتة",
    desc_en: "Bring the raw beauty of nature into your interior with this one-of-a-kind teak root coffee table. Each table is meticulously carved from a single piece of weathered teak root and finished with a tempered glass top to showcase the organic complexity and strength of the wood.",
    desc_ar: "أدخل الجمال الخام للطبيعة في تصميمك الداخلي مع طاولة القهوة الفريدة من جذور خشب التيك. يتم نحت كل طاولة بدقة من قطعة واحدة من جذور التيك المعتقة وتغطيتها بسطح زجاجي مقوى لإظهار التعقيد الطبيعي وقوة الخشب.",
    price: 1850.00,
    stock: 4,
    images: [
      unsplash("1533090161767-e6ffed986c88"),
      unsplash("1499916078039-922301b0eb9b"),
      unsplash("1513694203232-719a280e022f"),
      unsplash("1594026112284-02bb6f3352fe")
    ]
  },
  // --- BEAUTY & WELLNESS (31-40) ---
  {
    category_id: 4,
    name_en: "Botanical Infusion Rare Facial Oil",
    name_ar: "زيت الوجه النادر 'بوتانيكال إنفيوجن'",
    desc_en: "Nourish your skin with this artisanal blend of eight rare botanical oils, infused with dried heritage flower petals. This lightweight, fast-absorbing oil provides deep antioxidant protection and a luxurious velvet-soft finish, restoring your skin's natural luminosity and resilience.",
    desc_ar: "غذي بشرتك مع هذا المزيج الحرفي المكون من ثمانية زيوت نباتية نادرة، والمعزز ببتلات الزهور التراثية المجففة. يوفر هذا الزيت خفيف الوزن وسريع الامتصاص حماية عميقة مضادة للأكسدة ولمسة مخملية ناعمة، مما يعيد لبشرتك إشراقها الطبيعي ومرونتها.",
    price: 110.00,
    stock: 40,
    images: [
      unsplash("1608248597279-f99d160bfcbc"),
      unsplash("1620916566398-39f1143f2c08"),
      unsplash("1601049533604-368625297241"),
      unsplash("1598440947619-2c35fc9aa908")
    ]
  },
  {
    category_id: 4,
    name_en: "Jade Roller & Gua Sha Sculpting Set",
    name_ar: "طقم نحت الوجه 'جاد رولر' وجوا شا",
    desc_en: "Elevate your skincare ritual with this authentic Grade-A jade roller and gua sha set. Designed to promote lymphatic drainage and reduce facial tension, these cooling stone tools enhance the absorption of your favorite serums while providing a calming, sculptural facial massage experience.",
    desc_ar: "ارتقِ بطقوس العناية ببشرتك مع طقم 'جاد رولر' وجوا شا المصنوع من حجر اليشم الأصلي من الفئة (أ). صُممت هذه الأدوات الحجرية المبردة لتعزيز التصريف اللمفاوي وتقليل توتر الوجه، وهي تزيد من امتصاص السيروم المفضل لديك مع توفير تجربة مساچ مهدئة ومنحوتة للوجه.",
    price: 65.00,
    stock: 75,
    images: [
      unsplash("1606760227091-3dd870d97f1d"),
      unsplash("1598440947619-2c35fc9aa908"),
      unsplash("1594494024039-f9c7929f3af4"),
      unsplash("1616394584738-fc6e612e71b9")
    ]
  },
  {
    category_id: 4,
    name_en: "Mediterranean Sea Salt Radiance Scrub",
    name_ar: "مقشر إشراق بملح البحر المتوسط",
    desc_en: "Reveal smoother, more vibrant skin with this mineral-rich Mediterranean sea salt scrub. Infused with organic lemon peel and cold-pressed olive oil, it gently exfoliates while providing deep hydration and a refreshing citrus aroma for a spa-like revitalization at home.",
    desc_ar: "اكشفي عن بشرة أنعم وأكثر حيوية مع مقشر ملح البحر المتوسط الغني بالمعادن. بفضل قشر الليمون العضوي وزيت الزيتون المعصور على البارد، يقشر البشرة بلطف مع توفير ترطيب عميق ورائحة حمضيات منعشة لتجربة تجديد تشبه السبا في المنزل.",
    price: 55.00,
    stock: 85,
    images: [
      unsplash("1556229162-5c63ed9c4efb"),
      unsplash("1600428791246-e5f8bc875704"),
      unsplash("1590439471364-192aa70c0b53"),
      unsplash("1608248597279-f99d160bfcbc")
    ]
  },
  {
    category_id: 4,
    name_en: "Vegan Silk Pure Beauty Sleep Mask",
    name_ar: "قناع نوم 'فيجان سيلك' للجمال الخالص",
    desc_en: "Protect your delicate eye area and ensure uninterrupted rest with this 100% vegan silk sleep mask. Crafted from high-grade bamboo-derived silk alternatives, it provides a cooling, hypoallergenic surface that prevents sleep-induced fine lines and enhances your beauty rest.",
    desc_ar: "احمي منطقة العين الحساسة واضمني راحة غير منقطعة مع قناع النوم المصنوع من الحرير النباتي بنسبة 100٪. مصنوع من بدائل الحرير عالية الجودة المستخرجة من البامبو، ويوفر سطحاً مبرداً ومضاداً للحساسية يمنع الخطوط الدقيقة الناتجة عن النوم ويعزز جمالك.",
    price: 45.00,
    stock: 100,
    images: [
      unsplash("1582719471327-593539097e61"),
      unsplash("1584308666744-24d5c474f2ae"),
      unsplash("1616645300521-72bb83516646"),
      unsplash("1517409249051-787093397984")
    ]
  },
  {
    category_id: 4,
    name_en: "Hand-Milled Provencal Lavender Soap",
    name_ar: "صابون لافندر بروفنسال مطحون يدوياً",
    desc_en: "Experience the calming essence of the French countryside with this triple-milled lavender soap. Infused with organic shea butter and heritage botanicals, it creates a rich, creamy lather that gently cleanses and deeply nourishes, leaving your skin soft and delicately scented.",
    desc_ar: "اختبري جوهر الهدوء في الريف الفرنسي مع صابون اللافندر المطحون ثلاث مرات. مع زبدة الشيا العضوية والنباتات التراثية، يخلق رغوة غنية وكريمية تنظف بلطف وتغذي بعمق، مما يترك بشرتك ناعمة ومعطرة بدقة.",
    price: 35.00,
    stock: 150,
    images: [
      unsplash("1600857062241-98e5dba7f214"),
      unsplash("1547793548-7a044de32964"),
      unsplash("1554469384-e58fac16e23a"),
      unsplash("1590439471364-192aa70c0b53")
    ]
  },
  {
    category_id: 4,
    name_en: "Artisan Walnut Hand-Turned Shaving Kit",
    name_ar: "طقم حلاقة حرفي من خشب الجوز",
    desc_en: "Transform your grooming routine with this exquisite hand-turned walnut shaving kit. Featuring a silver-tipped synthetic badger brush and a weighted safety razor, it provides a classic, precise shaving experience that combines traditional craftsmanship with modern ergonomics.",
    desc_ar: "حول روتين العناية بجمالك مع طقم الحلاقة الفاخر المصنوع من خشب الجوز. يتميز بفرشاة صناعية ذات أطراف فضية وشفرة حلاقة آمنة ثقيلة، ويوفر تجربة حلاقة كلاسيكية ودقيقة تجمع بين الحرفية التقليدية والمريحيات الحديثة.",
    price: 240.00,
    stock: 20,
    images: [
      unsplash("1621607512214-68297480165e"),
      unsplash("1503951914875-452162b0f3f1"),
      unsplash("1592914610354-fd354ea45e48"),
      unsplash("1512690196152-73bc71c352d8")
    ]
  },
  {
    category_id: 4,
    name_en: "Matte Lipstick Wardrobe - Timeless Collection",
    name_ar: "مجموعة أحمر شفاه مطفي - كولكشن تايمليس",
    desc_en: "Curate your look with this set of four pigment-rich matte lipsticks in iconic timeless shades. From deep mahogany to classic crimson, the long-wearing botanical formula provides a flawless, velvety finish and vibrant color impact that lasts through the most demanding days.",
    desc_ar: "اختاري مظهرك مع هذا الطقم المكون من أربعة ألوان أحمر شفاه مطفي غنية بالأصباغ وبألوان أيقونية خالدة. من الماهوجني العميق إلى القرمزي الكلاسيكي، توفر التركيبة النباتية طويلة الأمد لمسة مخملية مثالية وتأثير لون حيوي يدوم طويلاً.",
    price: 185.00,
    stock: 50,
    images: [
      unsplash("1586776182313-8d69288019e0"),
      unsplash("1571646034647-52e6ea84b28c"),
      unsplash("1591360236480-4ed861025a18"),
      unsplash("1625093742435-6fa192b6fb10")
    ]
  },
  {
    category_id: 4,
    name_en: "Mineral-Rich Dead Sea Sculpting Mud Mask",
    name_ar: "قناع طين البحر الميت الغني بالمعادن",
    desc_en: "Detoxify and refine your skin with this professional-grade Dead Sea mud mask. Featuring a high concentration of essential minerals and active botanicals, it deep-cleanses pores and improves skin texture, providing a visible sculpting effect and a revitalized, healthy glow.",
    desc_ar: "طهري ونقي بشرتك مع قناع طين البحر الميت ذو الفئة الاحترافية. يتميز بتركيز عالٍ من المعادن الأساسية والنباتات النشطة، وينظف المسام بعمق ويحسن ملمس البشرة، مما يوفر تأثيراً ملحوظاً في النحت وإشراقاً صحياً وحيوياً.",
    price: 95.00,
    stock: 80,
    images: [
      unsplash("1596461404969-9ae70f2830c1"),
      unsplash("1570172619644-dfd03ed5d881"),
      unsplash("1601049541289-9b1b7abcfe19"),
      unsplash("1601049534005-0678d46e30b4")
    ]
  },
  {
    category_id: 4,
    name_en: "Zen-Mist Ultrasonic Essential Oil Diffuser",
    name_ar: "فواحة زيوت عطرية 'زين-ميست' بالموجات فوق الصوتية",
    desc_en: "Create a sanctuary of calm in your home with the Zen-Mist ultrasonic diffuser. Featuring a minimalist ceramic design and whisper-quiet technology, it disperses a fine cool mist of pure essential oils to enhance your mood, improve air quality, and provide a spa-like atmosphere.",
    desc_ar: "أنشئي ملاذاً للهدوء في منزلك مع فواحة 'زين-ميست' بالموجات فوق الصوتية. تتميز بتصميم سيراميك بسيط وتقنية صامتة تماماً، وتوزع رذاذاً ناعماً وبارداً من الزيوت العطرية النقية لتعزيز مزاجك وتحسين جودة الهواء وتوفير جو يشبه السبا.",
    price: 145.00,
    stock: 45,
    images: [
      unsplash("1602928321679-560bb453f190"),
      unsplash("1524230612046-e717e305373a"),
      unsplash("1506459225024-1428097a7e18"),
      unsplash("1608571423902-eed4a5ad8108")
    ]
  },

  // --- SPORTS & FITNESS (41-50) ---
  {
    category_id: 5,
    name_en: "Elite Carbon Fiber Aerodynamic Road Bike",
    name_ar: "دراجة طريق من ألياف الكربون النخبوية",
    desc_en: "Experience ultimate speed and precision with this ultra-lightweight carbon fiber road bike. Engineered with advanced aerodynamic geometry and a professional-grade 22-speed electronic shifting system, it is designed for maximum energy transfer and a seamless, high-performance ride at the edge of human limits.",
    desc_ar: "اختبر السرعة والدقة الفائقة مع هذه الدراجة المصنوعة من ألياف الكربون خفيفة الوزن للغاية. صُممت بهندسة آيروديناميكية متقدمة ونظام تغيير سرعات إلكتروني احترافي بـ 22 سرعة، وهي مصممة لأقصى قدر من نقل الطاقة ورحلة عالية الأداء وسلسة عند حدود القدرات البشرية.",
    price: 3200.00,
    stock: 6,
    images: [
      unsplash("1485965120184-e220f721d03e"),
      unsplash("1532298229144-0ee0516fa8cc"),
      unsplash("1507035895480-2b3156c31fc8"),
      unsplash("1571068316344-75bc76f77891")
    ]
  },
  {
    category_id: 5,
    name_en: "Pro-Grip Smart Sensor Eco Yoga Mat",
    name_ar: "سجادة يوغا ذكية 'برو-غريب' صديقة للبيئة",
    desc_en: "Elevate your practice with this eco-friendly yoga mat featuring integrated smart haptic sensors. Connects to your device to provide real-time feedback on your balance and posture alignment, while the advanced high-traction surface ensures ultimate stability even during the most demanding hot yoga sessions.",
    desc_ar: "ارتقِ بممارستك مع سجادة اليوغا الصديقة للبيئة التي تتميز بمستشعرات لمسية ذكية مدمجة. تتصل بجهازك لتقديم ملاحظات فورية حول توازنك ومحاذاة قوامك، بينما يضمن السطح المتقدم عالي الثبات استقراراً مطلقاً حتى خلال أصعب جلسات اليوغا الساخنة.",
    price: 155.00,
    stock: 45,
    images: [
      unsplash("1544367567-0f2fcb009e0b"),
      unsplash("1592419044706-39796d40f98c"),
      unsplash("1601925260368-ae2f83cf8b7f"),
      unsplash("1510894347713-fc3ad6cb0d0d")
    ]
  },
  {
    category_id: 5,
    name_en: "Stealth Core Wall-Mounted Multi-Gym",
    name_ar: "نظام جيم منزلي 'ستيلث كور' متعدد الاستخدامات",
    desc_en: "Transform your home workout with this compact wall-mounted multi-gym system. Featuring silent magnetic resistance and over 60 targeted exercises, it provides a full-body strength and conditioning program in a sleek, minimalist design that blends perfectly into your modern living space.",
    desc_ar: "حول تمرينك المنزلي مع نظام الجيم المتعدد المعلق على الحائط والمدمج. يتميز بمقاومة مغناطيسية صامتة وأكثر من 60 تمريناً مستهدفاً، ويوفر برنامجاً كاملاً لتقوية وتكييف الجسم بتصميم أنيق وبسيط يندمج تماماً مع مساحة معيشتك العصرية.",
    price: 1850.00,
    stock: 4,
    images: [
      unsplash("1534438327276-14e5300c3a48"),
      unsplash("1517836357463-d25dfeac3438"),
      unsplash("1540497077202-7c8a3999166f"),
      unsplash("1526506118085-60ce8714f8c5")
    ]
  },
  {
    category_id: 5,
    name_en: "Titan Recover V3 Percussive Massager",
    name_ar: "جهاز التدليك المطرقي 'تايتان ريكفر V3'",
    desc_en: "Accelerate your recovery with the Titan Recover V3, a professional percussion massager featuring quiet-glide technology. Delivers deep-tissue stimulation with calibrated intensity to relieve muscle soreness, improve circulation, and enhance flexibility for top-tier athletic performance.",
    desc_ar: "سرع من تعافيك مع جهاز 'تايتان ريكفر V3'، وهو جهاز تدليك مطرقي احترافي يتميز بتقنية الانزلاق الصامت. يوفر تحفيزاً للأنسجة العميقة بكثافة محسوبة لتخفيف آلام العضلات وتحسين الدورة الدموية وتعزيز المرونة للأداء الرياضي من الدرجة الأولى.",
    price: 340.00,
    stock: 30,
    images: [
      unsplash("1515377905703-c4788e51af15"),
      unsplash("1544117518-30df578096a4"),
      unsplash("1596727147705-61a532a31d10"),
      unsplash("1519823551278-64ac92734fb1")
    ]
  },
  {
    category_id: 5,
    name_en: "Aero-Flow Italian Seamless Tennis Outfit",
    name_ar: "طقم تنس إيطالي 'إيرو-فلو' بدون خياطة",
    desc_en: "Dominate the court in ultimate comfort with this premium seamless tennis outfit, crafted in Italy. Featuring advanced moisture-wicking fabric and strategic ventilation zones, it provides unrestricted range of motion and technical performance wrapped in a sophisticated, high-contrast aesthetic.",
    desc_ar: "سيطر على الملعب براحة مطلقة مع طقم التنس الفاخر بدون خياطة، المصنوع في إيطاليا. يتميز بقماش متطور لامتصاص الرطوبة ومناطق تهوية استراتيجية، ويوفر نطاق حركة غير مقيد وأداءً تقنياً مغلفاً بجمالية راقية وعالية التباين.",
    price: 195.00,
    stock: 25,
    images: [
      unsplash("1545931790-2647781fbc0d"),
      unsplash("1599586120429-48281b6f0ece"),
      unsplash("1622279457486-62dcc4a4977b"),
      unsplash("1560012057-4372e14c5085")
    ]
  },
  {
    category_id: 5,
    name_en: "Hydro-Guard V2 Waterproof Fitness Tracker",
    name_ar: "متتبع لياقة 'هيدرو-جارد V2' مقاوم للماء",
    desc_en: "Dive into your training with the Hydro-Guard V2, featuring military-grade waterproof construction and hyper-accurate biometric tracking. Accurately monitors heart rate, blood oxygen, and performance metrics across 100+ sports modes, providing detailed training insights in any environment.",
    desc_ar: "انغمس في تدريبك مع 'هيدرو-جارد V2'، الذي يتميز ببنية مقاومة للماء بمعايير عسكرية وتتبع بيومتري فائق الدقة. يراقب معدل ضربات القلب وأكسجين الدم ومقاييس الأداء بدقة عبر أكثر من 100 وضع رياضي، مما يوفر رؤى تدريبية مفصلة في أي بيئة.",
    price: 199.00,
    stock: 55,
    images: [
      unsplash("1575311373937-040b8e1fd5b6"),
      unsplash("1523275335684-37898b6baf30"),
      unsplash("1510017803434-a899398421b3"),
      unsplash("1550928224-b0a70138986c")
    ]
  },
  {
    category_id: 5,
    name_en: "Bio-Engineered Graduated Compression Sleeves",
    name_ar: "أكمام ضغط متدرجة هندسية حيوية",
    desc_en: "Maximize your endurance and recovery with these professional-grade graduated compression sleeves. Engineered with targeted pressure zones to enhance blood flow and stabilize muscles, they reduce fatigue during intense training and accelerate metabolic recovery for your next peak performance.",
    desc_ar: "عظم قدرتك على التحمل وتعافيك مع أكمام الضغط المتدرجة ذات الفئة الاحترافية. صُممت بمناطق ضغط مستهدفة لتعزيز تدفق الدم وتثبيت العضلات، وهي تقلل من التعب خلال التدريب المكثف وتسرع التعافي الأيضي لأدائك القادم.",
    price: 85.00,
    stock: 90,
    images: [
      unsplash("1518611012118-29a8d63a8621"),
      unsplash("1506126613408-eca07ce68773"),
      unsplash("1552674605-db6ffd4facb5"),
      unsplash("1517409249051-787093397984")
    ]
  },
  {
    category_id: 5,
    name_en: "Quantum Speed Precision High-Bearing Jump Rope",
    name_ar: "حبل قفز 'كوانتم سبيد' عالي السرعة",
    desc_en: "Master high-intensity conditioning with the Quantum Speed jump rope. Featuring a dual-bearing rotation system and a weighted adjustable steel cable, it provides effortless speed and consistent rotation for professional athletes looking to refine their footwork and cardiovascular endurance.",
    desc_ar: "أتقن التكييف البدني عالي الكثافة مع حبل قفز 'كوانتم سبيد'. يتميز بنظام دوران مزدوج المحامل وكابل فولاذي ثقيل قابل للتعديل، ويوفر سرعة سهلة ودوراناً ثابتاً للرياضيين المحترفين الذين يتطلعون لتحسين عمل القدم والتحمل الدوري التنفسي.",
    price: 45.00,
    stock: 120,
    images: [
      unsplash("1517963879433-6ad2b056d712"),
      unsplash("1544216717-3bbf52512659"),
      unsplash("1434682881908-b43d0467b798"),
      unsplash("1434608519344-49d77a699e1d")
    ]
  },
  {
    category_id: 5,
    name_en: "Granite Select-Dial Adjustable Dumbbell Set",
    name_ar: "طقم دمبل 'جرانيت' قابل للتعديل بالقرص",
    desc_en: "Streamline your home gym with these innovative adjustable dumbbells. Featuring a precision select-dial system that replaces 15 individual weight sets, it allows you to switch seamlessly from 5 to 52.5 lbs in seconds, providing a comprehensive and organized strength training experience.",
    desc_ar: "نظم صالة الألعاب الرياضية المنزلية الخاصة بك مع هذه الدامبلز المبتكرة القابلة للتعديل. تتميز بنظام قرص اختيار دقيق يحل محل 15 طقم أوزان منفرد، وتتيح لك التبديل بسلاسة من 5 إلى 52.5 رطلاً في ثوانٍ، مما يوفر تجربة تدريب قوة شاملة ومنظمة.",
    price: 495.00,
    stock: 10,
    images: [
      unsplash("1583454110551-21f2fa2ec617"),
      unsplash("1576678927484-cc907957088c"),
      unsplash("1517836357463-d25dfeac3438"),
      unsplash("1526506118085-60ce8714f8c5")
    ]
  },
  {
    category_id: 5,
    name_en: "Zazen Silk Buckwheat Meditation Cushion",
    name_ar: "وسادة تأمل 'زازين' من الحرير والحنطة السوداء",
    desc_en: "Achieve deep stillness with this artisanal zafu meditation cushion. Wrapped in luxurious organic silk and filled with sustainable buckwheat hulls, the ergonomic structured design promotes perfect spinal alignment and lasting comfort for extended mindfulness and contemplation sessions.",
    desc_ar: "حقق سكوناً عميقاً مع وسادة تأمل زافو الحرفية. مغلفة بالحرير العضوي الفاخر ومحشوة بقشور الحنطة السوداء المستدامة، يعزز التصميم الهيكلي المريح المحاذاة المثالية للعمود الفقري والراحة الدائمة لجلسات الوعي والتأمل الطويلة.",
    price: 95.00,
    stock: 40,
    images: [
      unsplash("1545208393-596cc6759025"),
      unsplash("1506126613408-eca07ce68773"),
      unsplash("1599447421416-3414500d18a5"),
      unsplash("1510894347713-fc3ad6cb0d0d")
    ]
  },

  // --- WATCHES & ACCESSORIES (51-60) ---
  {
    category_id: 6,
    name_en: "Heritage Chronograph Swiss Automatic Watch",
    name_ar: "ساعة سويسرية أوتوماتيكية 'هيريتج كرونوغراف'",
    desc_en: "Timeless craftsmanship meets Swiss precision in this elegant automatic chronograph watch. Featuring an exposed movement and a surgical-grade stainless steel case, it embodies a heritage aesthetic of modern luxury. Finished with a hand-stitched Italian leather strap that develops a unique character with time.",
    desc_ar: "تجتمع الحرفية الخالدة مع الدقة السويسرية في هذه الساعة الكرونوغراف الأوتوماتيكية الأنيقة. تتميز بماكينة مكشوفة وهيكل من الفولاذ المقاوم للصدأ الطبي، وتجسد جمالية تراثية للفخامة الحديثة. مكتملة بحزام من الجلد الإيطالي المخيط يدوياً والذي يكتسب طابعاً فريداً بمرور الوقت.",
    price: 1850.00,
    stock: 8,
    images: [
      unsplash("1524592094714-0f0654e20314"),
      unsplash("1522312346375-d1ad5051639f"),
      unsplash("1542496658-e33a6d0d50f6"),
      unsplash("1508685096489-7aac29145fe4")
    ]
  },
  {
    category_id: 6,
    name_en: "Modernist Titanium Polarized Aviators",
    name_ar: "نظارات أفياتور مستقطبة من التيتانيوم العصري",
    desc_en: "Redefine your perspective with these ultra-lightweight titanium aviator sunglasses. Featuring precision-engineered polarized lenses for ultimate clarity and a minimalist structured frame, they offer a sophisticated and versatile style that perfectly complements any face shape and high-end attire.",
    desc_ar: "أعد تحديد منظورك مع نظارات أفياتور المصنوعة من التيتانيوم خفيف الوزن للغاية. تتميز بعدسات مستقطبة مصممة بدقة لأقصى قدر من الوضوح وإطار مهيكل بسيط، وتقدم أسلوباً راقياً ومتعدد الاستخدامات يكمل تماماً أي شكل وجه وملابس فاخرة.",
    price: 340.00,
    stock: 20,
    images: [
      unsplash("1572635196237-14b3f281503f"),
      unsplash("1511499767350-a1590fdb28bf"),
      unsplash("1511499008188-057d8d71568d"),
      unsplash("1591076482161-42ce6da69f67")
    ]
  },
  {
    category_id: 6,
    name_en: "Artisanal Vegetable-Tanned Braided Leather Bracelet",
    name_ar: "سوار جلدي مضفر يدوياً مدبوغ نباتياً",
    desc_en: "Add a touch of rugged elegance to your wrist with this hand-braided bracelet, made from premium vegetable-tanned Italian leather. Featuring a unique magnetic clasp with an intricate geometric pattern, it is a versatile accessory that makes a sophisticated statement either on its own or layered.",
    desc_ar: "أضف لمسة من الأناقة الخشنة لمعصمك مع هذا السوار المنسوج يدوياً، والمصنوع من الجلد الإيطالي الفاخر المدبوغ نباتياً. يتميز بمشبك مغناطيسي فريد بنمط هندسي معقد، وهو إكسسوار متعدد الاستخدامات يمنح طابعاً راقياً سواء تم ارتداؤه منفرداً أو مع إكسسوارات أخرى.",
    price: 125.00,
    stock: 60,
    images: [
      unsplash("1515562141207-7a88fb7ce338"),
      unsplash("1611591437281-460bfbe1220a"),
      unsplash("1506190500382-d27e2535939e"),
      unsplash("1611085216821-43486509f621")
    ]
  },
  {
    category_id: 6,
    name_en: "Midnight Blue Jacquard Hand-Finished Silk Tie Set",
    name_ar: "طقم ربطة عنق حريرية جاكار أزرق داكن",
    desc_en: "Master the art of formal dressing with this coordinated set featuring a luxurious jacquard-woven silk tie and matching pocket square. The deep midnight blue hue and subtle micro-geometric pattern offer a sophisticated look for the boardroom and the most prestigious evening events.",
    desc_ar: "أتقن فن اللباس الرسمي مع هذا الطقم المنسق الذي يتميز بربطة عنق حريرية منسوجة بنقشة الجاكار ومنديل جيب متطابق. يوفر لون أزرق منتصف الليل العميق ونمط المايكرو الهندسي الدقيق مظهراً راقياً لاجتماعات مجلس الإدارة وأكثر المناسبات المسائية مرموقة.",
    price: 145.00,
    stock: 40,
    images: [
      unsplash("1589118949245-7d38baf380d6"),
      unsplash("1594932224010-756643c71df5"),
      unsplash("1523293182086-7651a899d37f"),
      unsplash("1602052577122-f73b9710adba")
    ]
  },
  {
    category_id: 6,
    name_en: "Sterling Silver Obsidian Geometric Cufflinks",
    name_ar: "أزرار أكمام هندسية من الفضة والسبج",
    desc_en: "Elevate your evening attire with these architectural cufflinks, expertly crafted from solid sterling silver with genuine obsidian inlays. The minimalist geometric design and high-polish finish reflect light beautifully, adding a touch of modern luxury to your French cuffs and formal presence.",
    desc_ar: "ارتقِ بملابسك المسائية مع هذه الأزرار المعمارية للأكمام، المصنوعة بخبرة من الفضة الإسترلينية الصلبة مع ترصيع من حجر السبج الأصلي. يعكس التصميم الهندسي البسيط واللمسة النهائية المصقولة الضوء بشكل جميل، مما يضيف لمسة من الفخامة العصرية لأكمامك الفرنسية وحضورك الرسمي.",
    price: 210.00,
    stock: 25,
    images: [
      unsplash("1611591437281-460bfbe1220a"),
      unsplash("1503951914875-452162b0f3f1"),
      unsplash("1592914610354-fd354ea45e48"),
      unsplash("1512690196152-73bc71c352d8")
    ]
  },
  {
    category_id: 6,
    name_en: "Premium Saffiano Structured Document Briefcase",
    name_ar: "حقيبة مستندات مهيكلة من جلد السافيانو الفاخر",
    desc_en: "Command professional respect with this sleek document briefcase, crafted from world-renowned Saffiano leather for exceptional scratch resistance. Features a minimalist structured design with organized internal compartments for your laptop and essential professional gear, finished with polished gunmetal hardware.",
    desc_ar: "افرض احترامك المهني مع حقيبة المستندات الأنيقة هذه، المصنوعة من جلد السافيانو المشهور عالمياً لمقاومة استثنائية للخدش. تتميز بتصميم مهيكل وبسيط مع أقسام داخلية منظمة لجهاز اللابتوب ومعداتك المهنية الأساسية، ومكتملة بقطع معدنية مصقولة من النوع المخضب.",
    price: 580.00,
    stock: 12,
    images: [
      unsplash("1548036328-c9fa89d128fa"),
      unsplash("1553062407-98eeb94c6a62"),
      unsplash("1506794778202-cad84cf45f1d"),
      unsplash("1511405946472-a37e3b5ccd4f")
    ]
  },
  {
    category_id: 6,
    name_en: "Ethereal Chiffon Pure Silk Botanical Scarf",
    name_ar: "وشاح حريري شيفون نباتي أثيري",
    desc_en: "Add an ethereal layer of elegance to any ensemble with this sheer silk chiffon scarf. Featuring a vibrant botanical print and a hand-rolled hem finish, the lightweight airy fabric provides a luxurious feel and a beautiful, fluid drape that perfectly captures the essence of refined, feminine grace.",
    desc_ar: "أضف طبقة أثيرية من الأناقة لأي طقم مع هذا الوشاح من شيفون الحرير الشفاف. يتميز بطبعة نباتية حيوية وحواف مطوية يدوياً، ويوفر القماش خفيف الوزن شعوراً فاخراً وانسيابية مذهلة تجسد ببراعة جوهر النعومة والأنوثة الراقية.",
    price: 195.00,
    stock: 35,
    images: [
      unsplash("1583337130417-3346a1be7dee"),
      unsplash("1515886657613-9f3515b0c78f"),
      unsplash("1496747611176-843222e1e57c"),
      unsplash("1475180098004-ca77a66827be")
    ]
  },
  {
    category_id: 6,
    name_en: "24K Gold-Plated Sculptural Statement Ring",
    name_ar: "خاتم منحوت مطلي بالذهب عيار 24",
    desc_en: "Make a contemporary statement with this bold sculptural ring, featuring an organic, fluid design hand-finished in 24K gold plating. The unique architectural form and high-polish surface create a dynamic play of light, reflecting a modern artistic expression and a commitment to timeless luxury.",
    desc_ar: "أدلي ببيان عصري مع هذا الخاتم المنحوت الجريء، الذي يتميز بتصميم انسيابي عضوي مطلي بالذهب عيار 24. يخلق الشكل المعماري الفريد والسطح المصقول تلاعباً ديناميكياً بالضوء، مما يعكس تعبيراً فنياً حديثاً والتزاماً بالفخامة الخالدة.",
    price: 165.00,
    stock: 30,
    images: [
      unsplash("1605100804763-247f67b3557e"),
      unsplash("1603561591411-071c4f7238a4"),
      unsplash("1598560945598-6320579e0004"),
      unsplash("1599459183200-59c26640c5f4")
    ]
  },
  {
    category_id: 6,
    name_en: "Artisan Ebony Wood & Blue Resin Keyring",
    name_ar: "ميدالية مفاتيح حرفية من خشب الأبنوس والريزن",
    desc_en: "Bring artisanal beauty to your daily essentials with this handcrafted keyring. Featuring a fusion of rare ebony wood and translucent blue resin, it is hand-polished to a glass-like finish, providing a unique miniature masterpiece that is both durable and visually captivating.",
    desc_ar: "أضف الجمال الحرفي لمقتنياتك اليومية مع ميدالية المفاتيح المصنوعة يدوياً. تتميز باندماج خشب الأبنوس النادر والريزن الأزرق الشفاف، وهي مصقولة يدوياً لتصل لمظهر زجاجي وتكون شاهكاراً مصغراً وقوياً وجذاباً بصرياً.",
    price: 65.00,
    stock: 80,
    images: [
      unsplash("1544027236-3a568c8c33df"),
      unsplash("1616150821301-4974fa2e2474"),
      unsplash("1617144837505-1a28a39cce42"),
      unsplash("1590736704728-f4730bb3c370")
    ]
  },
  {
    category_id: 6,
    name_en: "Cashmere-Lined Mongolian Lambskin Gloves",
    name_ar: "قفازات جلد الحمل المنغولي المبطنة بالكشمير",
    desc_en: "Experience the pinnacle of winter luxury with these supple lambskin leather gloves, exquisitely lined with 100% pure Mongolian cashmere. Featuring precise hand-stitching and touch-screen compatible fingertips, they offer exceptional warmth and sophisticated elegance for the modern city life.",
    desc_ar: "اختبر قمة الفخامة الشتوية مع هذه القفازات المصنوعة من جلد الحمل الناعم، المبطنة برقي بـ 100% من الكشمير المنغولي الخالص. تتميز بخياطة يدوية دقيقة وأطراف أصابع متوافقة مع شاشات اللمس، وتوفر دفئاً استثنائياً وأناقة راقية للحياة العصرية في المدينة.",
    price: 220.00,
    stock: 35,
    images: [
      unsplash("1549439602-43ebcb232811"),
      unsplash("1576402187878-974f70c890a5"),
      unsplash("1577174825967-b0a70138986c"),
      unsplash("1512401734994-47c7c3453b0a")
    ]
  }
];

async function seed() {
  const connection = await db.getConnection();
  try {
    console.log("🚀 Starting database seeding...");
    await connection.beginTransaction();

    // 1. Seed Categories
    console.log("📦 Seeding categories...");
    for (const cat of categories) {
      const slug = slugify(cat.name, { lower: true, strict: true });
      await connection.query(
        "INSERT INTO categories (id, name, name_ar, icon, image_url, slug) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), name_ar=VALUES(name_ar), icon=VALUES(icon), image_url=VALUES(image_url), slug=VALUES(slug)",
        [cat.id, cat.name, cat.name_ar, cat.icon, cat.image_url, slug],
      );
      console.log(`   ✅ Category: ${cat.name}`);
    }

    // 2. Seed Products
    console.log(`🛒 Seeding ${products.length} products...`);
    for (let i = 0; i < products.length; i++) {
        const prod = products[i];
      const slug = slugify(prod.name_en, { lower: true, strict: true });
      
      // Check if product exists by name_en
      const [existing] = await connection.query("SELECT id FROM products WHERE name = ?", [prod.name_en]);
      
      let productId;
      if (existing.length > 0) {
        productId = existing[0].id;
        await connection.query(
          "UPDATE products SET name_ar = ?, slug = ?, category_id = ?, price = ?, description = ?, description_ar = ?, stock = ?, is_active = 1 WHERE id = ?",
          [prod.name_ar, slug, prod.category_id, prod.price, prod.desc_en, prod.desc_ar, prod.stock, productId]
        );
        // Clear old images
        await connection.query("DELETE FROM product_images WHERE product_id = ?", [productId]);
      } else {
        const [result] = await connection.query(
          "INSERT INTO products (name, name_ar, slug, category_id, price, description, description_ar, stock, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)",
          [prod.name_en, prod.name_ar, slug, prod.category_id, prod.price, prod.desc_en, prod.desc_ar, prod.stock]
        );
        productId = result.insertId;
      }

      // 3. Seed Images
      for (let j = 0; j < prod.images.length; j++) {
        const imageUrl = prod.images[j];
        await connection.query(
          "INSERT INTO product_images (product_id, image_url, is_main) VALUES (?, ?, ?)",
          [productId, imageUrl, j === 0 ? 1 : 0]
        );
      }
      console.log(`   ✅ Product [${i+1}/60]: ${prod.name_en}`);
    }

    await connection.commit();
    console.log("⭐ Seeding completed successfully!");
  } catch (error) {
    await connection.rollback();
    console.error("❌ Seeding failed:", error);
  } finally {
    connection.release();
    process.exit();
  }
}

seed();
