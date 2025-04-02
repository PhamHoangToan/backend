const express=require("express");

const{getProduct, getProductById, createProduct, updateProduct, deleteProduct,searchProducts, upload}=require("../controllers/productController");

const router=express.Router();
router.get('/search', (req, res, next) => {
  console.log('Hit vào ROUTE /search');
  next(); // chuyển tiếp đến controller
}, searchProducts);
router.get("/", getProduct);
router.get("/:id", getProductById);
router.post("/", upload.single("image"), createProduct);

router.post("/", createProduct);
router.put("/:id",upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);


module.exports=router;