import db from "../config/db.js";
import slugify from "slugify";

const createCategory = async (req, res, next) => {
  try {
    let { name, slug, parent_id, is_active, sort_order, name_ar } =
      req.body || {};
    parent_id = parent_id || null;
    is_active = is_active !== undefined ? is_active : true;
    sort_order = sort_order !== undefined ? sort_order : 0;
    slug = slugify(name, { lower: true, strict: true });
    //check if name and slug are required
    if (!name || !slug || !name_ar) {
      return res.status(400).json({ message: "Name and slug are required" });
    }
    //image upload
    const image_url = req.file ? req.file.path : "";
    const [rows] = await db.query("SELECT * FROM categories WHERE slug = ?", [
      slug,
    ]);
    if (rows.length > 0) {
      return res.status(400).json({ message: "Category already exists" });
    }
    //insert category
    const [result] = await db.query(
      "INSERT INTO categories (name, slug, parent_id, is_active, sort_order, image_url,name_ar) VALUES (?, ?, ?, ?, ?, ?,?)",
      [name, slug, parent_id, is_active, sort_order, image_url, name_ar],
    );
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Category not created" });
    }
    //if success
    res.status(201).json({ message: "Category created successfully" });
  } catch (error) {
    next(error);
  }
};
//get categories with products
const getCategoriesWithProducts = async (req, res, next) => {
  try {
    // We use full table names: categories, products, and product_images
    const [rows] = await db.query(`
      SELECT 
        categories.*,
        IF(COUNT(products.id) > 0, 
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', products.id,
              'name', products.name,
              'name_ar', products.name_ar,
              'price', products.price,
              'slug', products.slug,
              'image', (
                SELECT image_url 
                FROM product_images 
                WHERE product_images.product_id = products.id 
                LIMIT 1
              )
            )
          ), 
          JSON_ARRAY()
        ) AS products
      FROM categories
      LEFT JOIN products ON categories.id = products.category_id
      GROUP BY categories.id
    `);

    // Format the products field to ensure it's a valid JavaScript Array
    const categories = rows.map((category) => ({
      ...category,
      products:
        typeof category.products === "string"
          ? JSON.parse(category.products)
          : category.products,
    }));

    // Success response with clear English message
    res.status(200).json({
      status: true,
      message: "Categories and their linked products fetched successfully",
      categories,
    });
  } catch (error) {
    // Pass any errors to the global error handler
    next(error);
  }
};
//get all categories
const getAllCategories = async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT * FROM categories");
    if (rows.length === 0) {
      return res.status(400).json({ message: "Categories not found" });
    }
    //if success
    res
      .status(200)
      .json({
        success: true,
        message: "Categories fetched successfully",
        data: rows,
      });
  } catch (error) {
    next(error);
  }
};
//get category by id
const getCategoryById = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Category not found" });
    }
    const [rows] = await db.query("SELECT * FROM categories WHERE id = ?", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(400).json({ message: "Category not found" });
    }
    //if success
    res
      .status(200)
      .json({ message: "Category fetched successfully", category: rows[0] });
  } catch (error) {
    next(error);
  }
};
//get category by id with products
const getCategoryByIdWithProducts = async (req, res, next) => {
  try {
    const { id } = req.params;

    // We fetch a specific category and aggregate its products into a JSON array
    const [rows] = await db.query(
      `
      SELECT 
        categories.*,
        IF(COUNT(products.id) > 0, 
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', products.id,
              'name', products.name,
              'name_ar', products.name_ar,
              'price', products.price,
              'slug', products.slug,
              'image', (
                SELECT image_url 
                FROM product_images 
                WHERE product_images.product_id = products.id 
                LIMIT 1
              )
            )
          ), 
          JSON_ARRAY()
        ) AS products_list
      FROM categories
      LEFT JOIN products ON categories.id = products.category_id
      WHERE categories.id = ?
      GROUP BY categories.id
    `,
      [id],
    );

    // Check if the category exists
    if (rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Category not found",
      });
    }

    // Format the products_list to be a clean JavaScript array
    const category = {
      ...rows[0],
      products:
        typeof rows[0].products_list === "string"
          ? JSON.parse(rows[0].products_list)
          : rows[0].products_list,
    };

    // Remove the raw products_list field from the final response
    delete category.products_list;

    res.status(200).json({
      status: true,
      message: "Category with its linked products fetched successfully",
      category,
    });
  } catch (error) {
    // Pass the error to the global error handler
    next(error);
  }
};
//update category
const updateCategory = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Category not found" });
    }
    const [rows] = await db.query("SELECT * FROM categories WHERE id = ?", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(400).json({ message: "Category not found" });
    }

    let { name, slug, parent_id, is_active, sort_order, name_ar } =
      req.body || {};
    name = name || rows[0].name;
    slug = name ? slugify(name, { lower: true, strict: true }) : rows[0].slug;
    parent_id = parent_id || rows[0].parent_id;
    is_active = is_active !== undefined ? is_active : rows[0].is_active;
    sort_order = sort_order || rows[0].sort_order;
    name_ar = name_ar || rows[0].name_ar;
    //image upload
    const image_url = req.file ? req.file.path : rows[0].image_url;
    const [result] = await db.query(
      "UPDATE categories SET name = ?, slug = ?, parent_id = ?, is_active = ?, sort_order = ?, image_url = ?,name_ar = ? WHERE id = ?",
      [name, slug, parent_id, is_active, sort_order, image_url, name_ar, id],
    );
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Category not updated" });
    }
    //if success
    res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    next(error);
  }
};
//delete category
// Delete a specific category and handle its dependencies
const deleteCategory = async (req, res, next) => {
  // Get a dedicated connection for the transaction
  const connection = await db.getConnection();

  try {
    const { id } = req.params;

    // 1. Check if the category exists before proceeding
    const [categoryRows] = await connection.query(
      "SELECT * FROM categories WHERE id = ?",
      [id],
    );
    if (categoryRows.length === 0) {
      await connection.release();
      return res.status(404).json({ message: "Category not found" });
    }

    // 3. Start Database Transaction
    await connection.beginTransaction();

    // 4. Cascade Delete: Delete product images first
    // We target all products belonging to this category
    await connection.query(
      `DELETE FROM product_images 
       WHERE product_id IN (SELECT id FROM products WHERE category_id = ?)`,
      [id],
    );

    // 5. Cascade Delete: Delete products
    await connection.query("DELETE FROM products WHERE category_id = ?", [id]);

    // 6. Delete the category record itself
    const [result] = await connection.query(
      "DELETE FROM categories WHERE id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      throw new Error("Failed to delete category from database");
    }

    // 7. Commit the transaction
    await connection.commit();

    res.status(200).json({
      status: true,
      message: "Category and all its linked products/images deleted successfully",
    });
  } catch (error) {
    // Rollback changes if any error occurs
    await connection.rollback();
    next(error);
  } finally {
    // Always release the connection back to the pool
    connection.release();
  }
};
//export
export {
  createCategory,
  getAllCategories,
  getCategoriesWithProducts,
  getCategoryById,
  getCategoryByIdWithProducts,
  updateCategory,
  deleteCategory,
};
