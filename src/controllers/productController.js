const Product = require("../model/Product");
const multer = require("multer");
const path = require("path");
const db = require("../config/db");
const fs = require("fs");




const getProduct = async (req, res) => {
    try {
        const products = await Product.getAll();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.getById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
// Create Multer instance with storage configuration
const upload = multer({ storage: storage });
 const createProduct = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Image is required." });
        }
        const { product_name, description, price, size, cate_id } = req.body;
        if (!product_name || !description || !price || !size || !cate_id) {
            return res.status(400).json({ error: "All fields are required." });
        }
        if (isNaN(price) || parseFloat(price) <= 0) {
            return res.status(400).json({ error: "Price must be a valid positive number." });
        }
        // Chuyển cate_id sang số nguyên
        const categoryId = parseInt(cate_id, 10);
        if (isNaN(categoryId)) {
            return res.status(400).json({ error: "Category ID must be a valid number." });
        }
        // Kiểm tra danh mục có tồn tại không
        const categoryExists = await Product.categoryExists(categoryId);
        if (!categoryExists) {
            return res.status(400).json({ error: "Danh mục không tồn tại!" });
        }
        // Lưu sản phẩm vào database
        const productData = {
            product_name,
            description,
            price: parseFloat(price),
            size,
            cate_id: categoryId,
            image: req.file ? req.file.filename : "",
        };
        const productId = await Product.create(productData);
        res.status(201).json({ id: productId, message: "Product created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while creating the product. Please try again later." });
    }
};


const updateProduct = async (req, res) => {
    try {
        const { product_name, description, price, size, cate_id } = req.body;
        let image = req.body.image;  // Lấy ảnh cũ từ body nếu có

        // Nếu có file mới, thay thế ảnh cũ bằng ảnh mới
        if (req.file) {
            image = req.file ? req.file.filename : "";
            console.log(image)// Đặt ảnh mới là ảnh vừa tải lên
        }

        const updateRows = await Product.update(
            req.params.id, 
            product_name, 
            image, 
            description, 
            price, 
            size, 
            cate_id
        );
        
        if (updateRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const deleteRows = await Product.delete(req.params.id);
        
        if (deleteRows === 0) return res.status(404).json({ message: "Product not found" });

        res.json({ message: "Product deleted successfully" }); // ✅ Fix lỗi sai message
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const searchProducts = async (req, res) => {
    const { keyword } = req.query;
  
    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập từ khóa tìm kiếm!'
      });
    }
  
    try {
      const products = await Product.searchProductsByName(keyword);
  
      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sản phẩm nào!'
        });
      }
  
      res.json({
        success: true,
        message: `Đã tìm thấy ${products.length} sản phẩm`,
        data: products
      });
    } catch (error) {
      console.error('Lỗi tìm kiếm sản phẩm:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi server!'
      });
    }
  };
  


module.exports = { getProduct, getProductById, createProduct, updateProduct, deleteProduct,searchProducts, upload };



