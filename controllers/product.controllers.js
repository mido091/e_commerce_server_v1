import db from "../config/db.js";
import slugify from "slugify";
import { expandQuery } from "../utils/searchHelper.js";

const parseJsonArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const splitImageList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
};

async function fetchColorOptions(connection, productIds) {
  if (!productIds.length) return new Map();

  const placeholders = productIds.map(() => "?").join(", ");
  const [rows] = await connection.query(
    `
      SELECT
        pc.id,
        pc.product_id,
        pc.color_key,
        pc.name,
        pc.name_ar,
        pc.value,
        pc.sort_order,
        pci.image_url,
        pci.is_main,
        pci.sort_order AS image_sort_order
      FROM product_colors pc
      LEFT JOIN product_color_images pci ON pc.id = pci.color_id
      WHERE pc.product_id IN (${placeholders})
      ORDER BY pc.product_id ASC, pc.sort_order ASC, pci.sort_order ASC, pci.id ASC
    `,
    productIds,
  );

  const productMap = new Map();
  const colorMap = new Map();

  for (const row of rows) {
    if (!colorMap.has(row.id)) {
      colorMap.set(row.id, {
        id: row.id,
        product_id: row.product_id,
        key: row.color_key || null,
        name: row.name,
        name_ar: row.name_ar || null,
        value: row.value,
        images: [],
        main_image: null,
      });
    }

    const color = colorMap.get(row.id);
    if (row.image_url) {
      color.images.push(row.image_url);
      if (!color.main_image || row.is_main) {
        color.main_image = row.image_url;
      }
    }

    if (!productMap.has(row.product_id)) {
      productMap.set(row.product_id, []);
    }
  }

  for (const color of colorMap.values()) {
    productMap.get(color.product_id)?.push(color);
  }

  return productMap;
}

async function fetchVariants(connection, productIds) {
  if (!productIds.length) return new Map();

  const placeholders = productIds.map(() => "?").join(", ");
  const [rows] = await connection.query(
    `
      SELECT
        pv.id,
        pv.product_id,
        pv.color_id,
        pv.size_value,
        pv.stock,
        pc.name AS color_name,
        pc.name_ar AS color_name_ar,
        pc.value AS color_value
      FROM product_variants pv
      LEFT JOIN product_colors pc ON pv.color_id = pc.id
      WHERE pv.product_id IN (${placeholders})
      ORDER BY pv.product_id ASC, pv.id ASC
    `,
    productIds,
  );

  const productMap = new Map();
  for (const row of rows) {
    if (!productMap.has(row.product_id)) {
      productMap.set(row.product_id, []);
    }
    productMap.get(row.product_id).push({
      id: row.id,
      color_id: row.color_id,
      color_name: row.color_name || null,
      color_name_ar: row.color_name_ar || null,
      color_value: row.color_value || null,
      size_value: row.size_value || null,
      stock: Number(row.stock || 0),
    });
  }

  return productMap;
}

async function enrichProducts(rows, connection = db) {
  if (!rows.length) return [];

  const productIds = rows.map((row) => row.id);
  const [colorOptionsMap, variantsMap] = await Promise.all([
    fetchColorOptions(connection, productIds),
    fetchVariants(connection, productIds),
  ]);

  return rows.map((row) => {
    const galleryImages = splitImageList(row.images);
    const colorOptions = colorOptionsMap.get(row.id) || [];
    const variants = variantsMap.get(row.id) || [];
    const fallbackColorImages = colorOptions.flatMap((color) => color.images || []);
    const images = galleryImages.length ? galleryImages : fallbackColorImages;
    const main_image = images[0] || colorOptions[0]?.main_image || null;

    return {
      ...row,
      images,
      main_image,
      size_mode: row.size_mode || "none",
      size_options: parseJsonArray(row.size_options),
      color_options: colorOptions,
      variants,
      has_variants:
        variants.length > 0 ||
        colorOptions.length > 0 ||
        parseJsonArray(row.size_options).length > 0,
    };
  });
}

const createProduct = async (req, res, next) => {
  try {
    let {
      name,
      name_ar,
      category_id,
      price,
      old_price,
      description,
      description_ar,
      specs_en,
      specs_ar,
      stock,
      is_active,
    } = req.body || {};

    if (!name || !category_id || !price || !description || !stock) {
      return res.status(400).json({ message: "All fields are required" });
    }

    is_active = is_active !== undefined ? is_active : true;
    price = parseFloat(price);
    old_price = old_price ? parseFloat(old_price) : null;
    stock = parseInt(stock, 10);

    if (Number.isNaN(price) || Number.isNaN(stock)) {
      return res.status(400).json({ message: "Price and stock must be numbers" });
    }

    if (old_price !== null && old_price <= price) {
      return res.status(400).json({ message: "Original price must be higher than current price" });
    }

    const slug = slugify(name, { lower: true, strict: true });
    const [rows] = await db.query("SELECT * FROM products WHERE name = ?", [name]);
    if (rows.length > 0) {
      return res.status(400).json({ message: "Product already exists" });
    }

    const [result] = await db.query(
      "INSERT INTO products (name, name_ar, category_id, price, old_price, slug, description, description_ar, specs_en, specs_ar, stock, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        name_ar || null,
        category_id,
        price,
        old_price,
        slug,
        description,
        description_ar || null,
        specs_en || null,
        specs_ar || null,
        stock,
        is_active,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Product not created" });
    }

    const productId = result.insertId;
    const imageFiles = (req.files || []).filter((file) => file.fieldname === "images");
    if (!imageFiles.length) {
      return res.status(400).json({ message: "Image is required" });
    }

    await Promise.all(
      imageFiles.map((file, index) =>
        db.query("INSERT INTO product_images (product_id, image_url, is_main) VALUES (?, ?, ?)", [
          productId,
          file.path,
          index === 0 ? 1 : 0,
        ]),
      ),
    );

    res.status(201).json({ message: "Product created successfully" });
  } catch (error) {
    next(error);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;
    const name = req.query.name || "";
    const category_id = req.query.category_id || "";
    const min_price = req.query.min_price || "";
    const max_price = req.query.max_price || "";

    const whereConditions = [];
    const queryParams = [];

    if (name) {
      const words = name.trim().split(/\s+/).filter((word) => word.length > 1);
      const wordGroups = [];

      words.forEach((word) => {
        const expandedTerms = expandQuery(word);
        const termQueries = [];
        expandedTerms.forEach((term) => {
          termQueries.push(
            "(products.name LIKE ? OR products.name_ar LIKE ? OR products.description LIKE ? OR products.description_ar LIKE ?)",
          );
          const likeTerm = `%${term}%`;
          queryParams.push(likeTerm, likeTerm, likeTerm, likeTerm);
        });
        if (termQueries.length) {
          wordGroups.push(`(${termQueries.join(" OR ")})`);
        }
      });

      if (wordGroups.length) {
        whereConditions.push(`(${wordGroups.join(" AND ")})`);
      }
    }

    if (category_id) {
      whereConditions.push("products.category_id = ?");
      queryParams.push(category_id);
    }

    if (min_price) {
      whereConditions.push("products.price >= ?");
      queryParams.push(parseFloat(min_price));
    }

    if (max_price) {
      whereConditions.push("products.price <= ?");
      queryParams.push(parseFloat(max_price));
    }

    const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(" AND ")}` : "";

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM products ${whereClause}`,
      queryParams,
    );

    const [rows] = await db.query(
      `
        SELECT
          products.*,
          categories.name AS category_name,
          categories.name_ar AS category_name_ar,
          GROUP_CONCAT(product_images.image_url ORDER BY product_images.is_main DESC, product_images.id ASC) AS images
        FROM products
        LEFT JOIN product_images ON products.id = product_images.product_id
        LEFT JOIN categories ON products.category_id = categories.id
        ${whereClause}
        GROUP BY products.id, categories.name, categories.name_ar
        ORDER BY products.id DESC
        LIMIT ? OFFSET ?
      `,
      [...queryParams, limit, offset],
    );

    const products = await enrichProducts(rows);

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Product not found" });
    }

    const [rows] = await db.query(
      `
        SELECT
          products.*,
          categories.name AS category_name,
          categories.name_ar AS category_name_ar,
          GROUP_CONCAT(product_images.image_url ORDER BY product_images.is_main DESC, product_images.id ASC) AS images
        FROM products
        LEFT JOIN product_images ON products.id = product_images.product_id
        LEFT JOIN categories ON products.category_id = categories.id
        WHERE products.id = ?
        GROUP BY products.id, categories.name, categories.name_ar
      `,
      [id],
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    const [product] = await enrichProducts(rows);

    const [[ratingData]] = await db.query(
      `
        SELECT COALESCE(AVG(rating), 0) AS avg_rating, COUNT(*) AS review_count
        FROM reviews
        WHERE product_id = ? AND is_approved = TRUE
      `,
      [id],
    );
    product.avg_rating = +Number(ratingData.avg_rating).toFixed(1);
    product.review_count = ratingData.review_count;

    const [relatedRows] = await db.query(
      `
        SELECT
          p.*,
          c.name AS category_name,
          c.name_ar AS category_name_ar,
          GROUP_CONCAT(pi.image_url ORDER BY pi.is_main DESC, pi.id ASC) AS images
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1
        GROUP BY p.id, c.name, c.name_ar
        ORDER BY p.id DESC
        LIMIT 5
      `,
      [product.category_id, id],
    );

    product.related_products = await enrichProducts(relatedRows);

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    let {
      name,
      name_ar,
      category_id,
      price,
      old_price,
      description,
      description_ar,
      specs_en,
      specs_ar,
      stock,
      is_active,
    } = req.body || {};

    const [rows] = await connection.query("SELECT * FROM products WHERE id = ?", [id]);
    if (!rows.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    await connection.beginTransaction();

    name = name || rows[0].name;
    name_ar = name_ar || rows[0].name_ar;
    price = price !== undefined ? parseFloat(price) : rows[0].price;
    old_price = old_price !== undefined ? (old_price ? parseFloat(old_price) : null) : rows[0].old_price;
    stock = stock !== undefined ? parseInt(stock, 10) : rows[0].stock;

    if (old_price !== null && old_price <= price) {
      return res.status(400).json({ message: "Original price must be higher than current price" });
    }

    is_active = is_active !== undefined ? is_active : rows[0].is_active;
    category_id = category_id || rows[0].category_id;
    const slug = name ? slugify(name, { lower: true, strict: true }) : rows[0].slug;

    await connection.query(
      "UPDATE products SET name = ?, name_ar = ?, slug = ?, category_id = ?, price = ?, old_price = ?, description = ?, description_ar = ?, specs_en = ?, specs_ar = ?, stock = ?, is_active = ? WHERE id = ?",
      [
        name,
        name_ar,
        slug,
        category_id,
        price,
        old_price,
        description || rows[0].description,
        description_ar !== undefined ? description_ar : rows[0].description_ar,
        specs_en !== undefined ? specs_en : rows[0].specs_en,
        specs_ar !== undefined ? specs_ar : rows[0].specs_ar,
        stock,
        is_active,
        id,
      ],
    );

    const imageFiles = (req.files || []).filter((file) => file.fieldname === "images");
    if (imageFiles.length) {
      await connection.query("DELETE FROM product_images WHERE product_id = ?", [id]);
      await Promise.all(
        imageFiles.map((file, index) =>
          connection.query(
            "INSERT INTO product_images (product_id, image_url, is_main) VALUES (?, ?, ?)",
            [id, file.path, index === 0 ? 1 : 0],
          ),
        ),
      );
    }

    await connection.commit();
    res.status(200).json({ status: true, message: "Product updated successfully" });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

const deleteProduct = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const id = req.params.id;
    const [rows] = await connection.query("SELECT * FROM products WHERE id = ?", [id]);
    if (!rows.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    await connection.beginTransaction();
    await connection.query("DELETE FROM product_images WHERE product_id = ?", [id]);
    await connection.query("DELETE FROM products WHERE id = ?", [id]);
    await connection.commit();

    res.status(200).json({
      status: true,
      message: "Product and its images deleted successfully",
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
