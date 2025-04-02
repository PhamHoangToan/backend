const Cart=require("../model/Cart")


const getCart  =async(req, res)=>{
    try {
        const cart= await Cart.getAll();
        res.json(cart)
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

// const getCartByUser = async (req, res) => {
//     try {
//         const cart = await Cart.getCartByUser(req.params.user_id);
//         if (!cart.length) return res.status(404).json({ message: "Cart is empty" });
//         res.json(cart);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// const addToCart = async (req, res) => {
//     try {
//       const { user_id, product_id, quantity } = req.body;
  
//       console.log("Thêm vào giỏ hàng:", { user_id, product_id, quantity });
  
//       // Kiểm tra dữ liệu thiếu
//       if (!user_id || !product_id || !quantity) {
//         return res.status(400).json({ success: false, message: "Thiếu thông tin cần thiết" });
//       }
  
//       const cart_id = await Cart.addToCart(user_id, product_id, quantity);
  
//       res.status(201).json({
//         success: true,
//         id: cart_id,
//         message: "Added to cart successfully",
//       });
//     } catch (error) {
//       console.error("Lỗi backend addToCart:", error);
//       res.status(500).json({ success: false, error: error.message });
//     }
//   };
  
  
const addToCart = async (req, res) => {
    try {
      const user_id = req.user.user_id; // lấy từ token đã decode
      const { product_id, quantity } = req.body;
  
      const cart_id = await Cart.addToCart(user_id, product_id, quantity);
  
      res.status(201).json({ success: true, id: cart_id, message: "Thêm vào giỏ hàng thành công!" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  const getCartByUser = async (req, res) => {
    try {
      const user_id = req.user.user_id;
  
      const cart = await Cart.getCartByUser(user_id);
  
      if (!cart.length) {
        return res.status(404).json({ success: false, message: "Giỏ hàng trống" });
      }
  
      res.json({ success: true, cart });
    } catch (error) {
      console.error("Lỗi backend getCartByUser:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  };
  
 
  const updateCart = async (req, res) => {
    try {
      const { quantity } = req.body;
      const cart_id = req.params.cart_id;
  
      if (!cart_id || quantity === undefined) {
        return res.status(400).json({ success: false, message: "Thiếu thông tin cart_id hoặc quantity" });
      }
  
      const updatedRows = await Cart.updateQuantity(cart_id, quantity);
  
      if (updatedRows === 0) {
        return res.status(404).json({ success: false, message: "Không tìm thấy cart item để cập nhật" });
      }
  
      res.json({ success: true, message: "Cập nhật giỏ hàng thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Có lỗi xảy ra khi cập nhật giỏ hàng", error: error.message });
    }
  };
  
//xoa  mot san pham
const deleteCartItem = async (req, res) => {
    try {
      const cart_id = req.params.cart_id;
  
      const deletedRows = await Cart.deleteItem(cart_id);
      if (deletedRows === 0) {
        return res.status(404).json({ message: "Cart item not found" });
      }
  
      res.json({ success: true, message: "Cart item deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  

//xoa toan bo san pham
const clearCart = async (req, res) => {
    try {
      const user_id = req.params.user_id;
  
      const deletedRows = await Cart.clearCart(user_id);
      if (deletedRows === 0) {
        return res.status(404).json({ message: "Cart is already empty" });
      }
  
      res.json({ success: true, message: "Cart cleared successfully" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  
module.exports={getCart, getCartByUser, addToCart, updateCart, deleteCartItem, clearCart};