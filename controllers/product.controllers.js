import db from "../config/db.js";
import slugify from "slugify";
import { expandQuery } from "../utils/searchHelper.js";
import { sendError, sendSuccess } from "../utils/apiError.js";

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
  const connection = await db.getConnection();
  try {
    let {
      name,
      name_ar,
      category_id,
      price,
      old_price,
      net_profit,
      description,
      description_ar,
      specs_en,
      specs_ar,
      stock,
      is_active,
      size_mode,
      size_options,
      colors,
      variant_stock,
    } = req.body || {};

    // ── Required field validation ─────────────────────────────────────
    if (!name || !category_id || !price || !description) {
      return sendError(res, 400, "VALIDATION_REQUIRED", "Name, category, price, and description are required");
    }

    // ── Parse numbers ─────────────────────────────────────────────────
    price = parseFloat(price);
    old_price = old_price ? parseFloat(old_price) : null;
    net_profit = net_profit !== undefined && net_profit !== "" ? parseFloat(net_profit) : null;
    stock = parseInt(stock, 10) || 0;
    is_active = is_active !== undefined ? Number(is_active) : 1;
    size_mode = size_mode || "none";

    if (Number.isNaN(price)) {
      return sendError(res, 400, "PRODUCT_INVALID_NUMBERS", "Price must be a valid number");
    }
    if (old_price !== null && old_price <= price) {
      return sendError(res, 400, "PRODUCT_OLD_PRICE_INVALID", "Original price must be higher than current price");
    }

    // ── Parse JSON arrays from FormData ───────────────────────────────
    const parsedColors   = parseJsonArray(colors);   // [{id,client_key,name,value,sort_order}]
    const parsedVariants = parseJsonArray(variant_stock); // [{color_key,size_value,stock}]
    const parsedSizes    = parseJsonArray(size_options);

    // ── Image files by fieldname ───────────────────────────────────────
    const allFiles = req.files || [];
    const generalImages = allFiles.filter((f) => f.fieldname === "images");

    // Color images are keyed as "color_images:<client_key>"
    const colorImageMap = {};
    allFiles
      .filter((f) => f.fieldname.startsWith("color_images:"))
      .forEach((f) => {
        const key = f.fieldname.replace("color_images:", "");
        if (!colorImageMap[key]) colorImageMap[key] = [];
        colorImageMap[key].push(f);
      });

    // ── Image requirement: need general images OR at least one color image ─
    const hasColorImages = Object.values(colorImageMap).some((arr) => arr.length > 0);
    if (!generalImages.length && !hasColorImages) {
      return sendError(res, 400, "UPLOAD_IMAGE_REQUIRED", "At least one product image is required", { field: "images" });
    }

    // ── Duplicate name check ──────────────────────────────────────────
    const slug = slugify(name, { lower: true, strict: true });
    const [existing] = await db.query("SELECT id FROM products WHERE name = ?", [name]);
    if (existing.length > 0) {
      return sendError(res, 400, "PRODUCT_EXISTS", "A product with this name already exists");
    }

    // ── Check DB schema for net_profit column ─────────────────────────
    const [columns] = await db.query("SHOW COLUMNS FROM products LIKE 'net_profit'");
    const hasNetProfit = columns.length > 0;

    await connection.beginTransaction();

    // ── Insert product ────────────────────────────────────────────────
    let insertSql, insertParams;
    if (hasNetProfit) {
      insertSql = "INSERT INTO products (name, name_ar, category_id, price, old_price, net_profit, slug, description, description_ar, specs_en, specs_ar, stock, is_active, size_mode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      insertParams = [name, name_ar || null, category_id, price, old_price, net_profit, slug, description, description_ar || null, specs_en || null, specs_ar || null, stock, is_active, size_mode];
    } else {
      insertSql = "INSERT INTO products (name, name_ar, category_id, price, old_price, slug, description, description_ar, specs_en, specs_ar, stock, is_active, size_mode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      insertParams = [name, name_ar || null, category_id, price, old_price, slug, description, description_ar || null, specs_en || null, specs_ar || null, stock, is_active, size_mode];
    }

    const [result] = await connection.query(insertSql, insertParams);
    if (result.affectedRows === 0) {
      await connection.rollback();
      return sendError(res, 500, "PRODUCT_CREATE_FAILED", "Product could not be created");
    }

    const productId = Number(result.insertId);

    // ── Save size_options ─────────────────────────────────────────────
    if (parsedSizes.length) {
      await connection.query(
        "UPDATE products SET size_options = ? WHERE id = ?",
        [JSON.stringify(parsedSizes), productId],
      );
    }

    // ── Save general images ───────────────────────────────────────────
    if (generalImages.length) {
      await Promise.all(
        generalImages.map((file, i) =>
          connection.query(
            "INSERT INTO product_images (product_id, image_url, is_main) VALUES (?, ?, ?)",
            [productId, file.path, i === 0 ? 1 : 0],
          ),
        ),
      );
    }

    // ── Save colors + color images ────────────────────────────────────
    const clientKeyToColorId = {};
    for (const color of parsedColors) {
      const [colorResult] = await connection.query(
        "INSERT INTO product_colors (product_id, color_key, name, name_ar, value, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
        [productId, color.value?.toLowerCase().replace(/\s+/g, "_") || color.client_key, color.name, color.name_ar || null, color.value, color.sort_order ?? 0],
      );
      const colorId = Number(colorResult.insertId);
      clientKeyToColorId[color.client_key] = colorId;

      const colorFiles = colorImageMap[color.client_key] || [];
      for (let i = 0; i < colorFiles.length; i++) {
        await connection.query(
          "INSERT INTO product_color_images (color_id, image_url, is_main, sort_order) VALUES (?, ?, ?, ?)",
          [colorId, colorFiles[i].path, i === 0 ? 1 : 0, i],
        );
      }
    }

    // ── Save variants (color × size combinations) ─────────────────────
    for (const variant of parsedVariants) {
      const colorId = variant.color_key ? clientKeyToColorId[variant.color_key] ?? null : null;
      await connection.query(
        "INSERT INTO product_variants (product_id, color_id, size_value, stock) VALUES (?, ?, ?, ?)",
        [productId, colorId, variant.size_value || null, Number(variant.stock || 0)],
      );
    }

    await connection.commit();
    sendSuccess(res, 201, { message: "Product created successfully", data: { id: productId } });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
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
      return sendError(res, 400, "PRODUCT_NOT_FOUND", "Product not found");
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
      return sendError(res, 404, "PRODUCT_NOT_FOUND", "Product not found");
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

    sendSuccess(res, 200, {
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
      net_profit,
      description,
      description_ar,
      specs_en,
      specs_ar,
      stock,
      is_active,
      size_mode,
      size_options,
      colors,
      variant_stock,
      existing_images,
    } = req.body || {};

    const [rows] = await connection.query("SELECT * FROM products WHERE id = ?", [id]);
    if (!rows.length) {
      return sendError(res, 404, "PRODUCT_NOT_FOUND", "Product not found");
    }

    // ── Parse numbers ─────────────────────────────────────────────────
    name = name || rows[0].name;
    category_id = category_id || rows[0].category_id;
    description = description || rows[0].description;
    price = price !== undefined ? parseFloat(price) : rows[0].price;
    old_price = old_price !== undefined ? (old_price ? parseFloat(old_price) : null) : rows[0].old_price;
    net_profit = net_profit !== undefined && net_profit !== "" ? parseFloat(net_profit) : rows[0].net_profit;
    stock = stock !== undefined ? parseInt(stock, 10) : rows[0].stock;
    is_active = is_active !== undefined ? Number(is_active) : rows[0].is_active;
    size_mode = size_mode || rows[0].size_mode || "none";

    if (Number.isNaN(price)) {
      return sendError(res, 400, "PRODUCT_INVALID_NUMBERS", "Price must be a valid number");
    }
    if (old_price !== null && old_price <= price) {
      return sendError(res, 400, "PRODUCT_OLD_PRICE_INVALID", "Original price must be higher than current price");
    }

    // ── Parse JSON arrays from FormData ───────────────────────────────
    const parsedColors     = parseJsonArray(colors);       // [{id,client_key,name,value,sort_order,existingImages}]
    const parsedVariants   = parseJsonArray(variant_stock); // [{color_key,size_value,stock}]
    const parsedSizes      = parseJsonArray(size_options);
    const parsedExtImages  = parseJsonArray(existing_images);

    // ── Image files by fieldname ───────────────────────────────────────
    const allFiles = req.files || [];
    const newGeneralImages = allFiles.filter((f) => f.fieldname === "images");

    const newColorImageMap = {};
    allFiles
      .filter((f) => f.fieldname.startsWith("color_images:"))
      .forEach((f) => {
        const key = f.fieldname.replace("color_images:", "");
        if (!newColorImageMap[key]) newColorImageMap[key] = [];
        newColorImageMap[key].push(f);
      });

    // ── Image validation ──────────────────────────────────────────────
    const hasAnyColorImage = parsedColors.some(c => (c.existingImages && c.existingImages.length > 0) || (newColorImageMap[c.client_key] && newColorImageMap[c.client_key].length > 0));
    const hasAnyGeneralImage = parsedExtImages.length > 0 || newGeneralImages.length > 0;
    
    if (!hasAnyGeneralImage && !hasAnyColorImage) {
      return sendError(res, 400, "UPLOAD_IMAGE_REQUIRED", "At least one product image is required in total", { field: "images" });
    }

    // ── Check DB schema for net_profit column ─────────────────────────
    const [columns] = await connection.query("SHOW COLUMNS FROM products LIKE 'net_profit'");
    const hasNetProfit = columns.length > 0;

    await connection.beginTransaction();

    const slug = name ? slugify(name, { lower: true, strict: true }) : rows[0].slug;

    // ── Update product ────────────────────────────────────────────────
    let updateSql, updateParams;
    if (hasNetProfit) {
      updateSql = "UPDATE products SET name = ?, name_ar = ?, slug = ?, category_id = ?, price = ?, old_price = ?, net_profit = ?, description = ?, description_ar = ?, specs_en = ?, specs_ar = ?, stock = ?, is_active = ?, size_mode = ?, size_options = ? WHERE id = ?";
      updateParams = [name, name_ar, slug, category_id, price, old_price, net_profit, description, description_ar !== undefined ? description_ar : rows[0].description_ar, specs_en !== undefined ? specs_en : rows[0].specs_en, specs_ar !== undefined ? specs_ar : rows[0].specs_ar, stock, is_active, size_mode, JSON.stringify(parsedSizes), id];
    } else {
      updateSql = "UPDATE products SET name = ?, name_ar = ?, slug = ?, category_id = ?, price = ?, old_price = ?, description = ?, description_ar = ?, specs_en = ?, specs_ar = ?, stock = ?, is_active = ?, size_mode = ?, size_options = ? WHERE id = ?";
      updateParams = [name, name_ar, slug, category_id, price, old_price, description, description_ar !== undefined ? description_ar : rows[0].description_ar, specs_en !== undefined ? specs_en : rows[0].specs_en, specs_ar !== undefined ? specs_ar : rows[0].specs_ar, stock, is_active, size_mode, JSON.stringify(parsedSizes), id];
    }

    await connection.query(updateSql, updateParams);

    // ── Rebuild general images ────────────────────────────────────────
    await connection.query("DELETE FROM product_images WHERE product_id = ?", [id]);
    
    let isMainAssigned = false;
    for (let i = 0; i < parsedExtImages.length; i++) {
        await connection.query(
          "INSERT INTO product_images (product_id, image_url, is_main) VALUES (?, ?, ?)",
          [id, parsedExtImages[i], !isMainAssigned ? 1 : 0],
        );
        isMainAssigned = true;
    }
    for (let i = 0; i < newGeneralImages.length; i++) {
        await connection.query(
          "INSERT INTO product_images (product_id, image_url, is_main) VALUES (?, ?, ?)",
          [id, newGeneralImages[i].path, !isMainAssigned ? 1 : 0],
        );
        isMainAssigned = true;
    }

    // ── Rebuild colors + color images ─────────────────────────────────
    await connection.query("DELETE FROM product_colors WHERE product_id = ?", [id]);
    const clientKeyToColorId = {};
    for (const color of parsedColors) {
      const [colorResult] = await connection.query(
        "INSERT INTO product_colors (product_id, color_key, name, name_ar, value, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
        [id, color.value?.toLowerCase().replace(/\s+/g, "_") || color.client_key, color.name, color.name_ar || null, color.value, color.sort_order ?? 0],
      );
      const colorId = Number(colorResult.insertId);
      clientKeyToColorId[color.client_key] = colorId;

      let isMainColorImgAssigned = false;
      const existColorImgs = color.existingImages || [];
      const newColorImgs = newColorImageMap[color.client_key] || [];
      
      let sortOrder = 0;
      for (const url of existColorImgs) {
        await connection.query(
          "INSERT INTO product_color_images (color_id, image_url, is_main, sort_order) VALUES (?, ?, ?, ?)",
          [colorId, url, !isMainColorImgAssigned ? 1 : 0, sortOrder++],
        );
        isMainColorImgAssigned = true;
      }
      for (const file of newColorImgs) {
        await connection.query(
          "INSERT INTO product_color_images (color_id, image_url, is_main, sort_order) VALUES (?, ?, ?, ?)",
          [colorId, file.path, !isMainColorImgAssigned ? 1 : 0, sortOrder++],
        );
        isMainColorImgAssigned = true;
      }
    }

    // ── Rebuild variants (color × size combinations) ──────────────────
    await connection.query("DELETE FROM product_variants WHERE product_id = ?", [id]);
    for (const variant of parsedVariants) {
      const colorId = variant.color_key ? clientKeyToColorId[variant.color_key] ?? null : null;
      await connection.query(
        "INSERT INTO product_variants (product_id, color_id, size_value, stock) VALUES (?, ?, ?, ?)",
        [id, colorId, variant.size_value || null, Number(variant.stock || 0)],
      );
    }

    await connection.commit();
    sendSuccess(res, 200, { status: true, message: "Product updated successfully" });
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
      return sendError(res, 404, "PRODUCT_NOT_FOUND", "Product not found");
    }

    await connection.beginTransaction();
    await connection.query("DELETE FROM product_images WHERE product_id = ?", [id]);
    await connection.query("DELETE FROM products WHERE id = ?", [id]);
    await connection.commit();

    sendSuccess(res, 200, {
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
