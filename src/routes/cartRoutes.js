const express=require("express");
const {getCart, getCartByUser, addToCart, updateCart, deleteCartItem, clearCart}=require('../controllers/cartController')

const authenticateToken = require("../middlewares/authenticateToken");
const router =express.Router();

router.get("/", getCart);
//router.get("/:user_id", getCartByUser);
router.post("/", authenticateToken, addToCart);
router.put("/:cart_id", authenticateToken, updateCart);
router.delete("/user/:user_id", authenticateToken, clearCart)
router.delete("/:cart_id", authenticateToken, deleteCartItem);
router.get("/cart", authenticateToken, getCartByUser);

module.exports=router;