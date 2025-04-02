const db = require("../config/db");

const Product = {
    getAll: async () => {
        // Dùng JOIN để lấy cả tên danh mục
        const [rows] = await db.query(`
            SELECT products.*, categories.name 
            FROM products 
            JOIN categories ON products.cate_id = categories.category_id
        `);
        return rows;
    },

    getById: async (product_id) => {
        const [rows] = await db.query(`
            SELECT products.*, categories.name 
            FROM products 
            JOIN categories ON products.cate_id = categories.category_id
            WHERE products.product_id = ?
        `, [product_id]);
        return rows[0];
    },

    async categoryExists(categoryId) {
        const [category] = await db.query("SELECT * FROM categories WHERE category_id = ?", [categoryId]);
        return category.length > 0;
    },

    // Tạo sản phẩm mới
    async create(productData) {
        const [result] = await db.query(
            "INSERT INTO products (product_name, description, price, size, cate_id, image) VALUES (?, ?, ?, ?, ?, ?)",
            [productData.product_name, productData.description, productData.price, productData.size, productData.cate_id, productData.image]
        );
        return result.insertId;
    },
    update: async (product_id, product_name, image, description, price, size, cate_id) => {
        const [category] = await db.query("SELECT * FROM categories WHERE category_id = ?", [cate_id]);
        if (category.length === 0) {
            throw new Error("Danh mục không tồn tại!");
        }

        const [result] = await db.query(
            "UPDATE products SET product_name = ?, image = ?, description = ?, price = ?, size = ?, cate_id = ? WHERE product_id = ?",
            [product_name, image, description, price, size, cate_id, product_id]
        );
        return result.affectedRows;
    },

    delete: async (product_id) => {
        const [result] = await db.query("DELETE FROM products WHERE product_id = ?", [product_id]);
        return result.affectedRows;
    },
    searchProductsByName: async (keyword) => {
        try {
          const [rows] = await db.execute(
            `SELECT * FROM products WHERE product_name LIKE ?`,
            [`%${keyword}%`]
          );
          return rows;
        } catch (error) {
          console.error('Lỗi trong model searchProductsByName:', error);
          throw error;
        }
      }
      
};

module.exports = Product;
