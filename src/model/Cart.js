const db=require('../config/db')

const Cart={
  getAll: async () => {
    try {
      const query = `
        SELECT 
          c.user_id AS id, 
          u.username, 
          CONCAT('[', IFNULL(GROUP_CONCAT(
            JSON_OBJECT(
              'product_name', IFNULL(p.product_name, ''),
              'image', IFNULL(p.image, ''),
              'price', IFNULL(p.price, 0),
              'quantity', IFNULL(c.quantity, 0)
            ) SEPARATOR ','), ''), ']') AS products
        FROM cart c
        INNER JOIN users u ON c.user_id = u.user_id
        INNER JOIN products p ON c.product_id = p.product_id
        GROUP BY c.user_id, u.username
      `;
  
      const [rows] = await db.query(query);
  
      return rows.map(row => {
        console.log("Dữ liệu JSON từ MySQL:", row.products);
        try {
          return {
            id: row.id,
            username: row.username,
            products: row.products && row.products !== '[]' ? JSON.parse(row.products) : []
          };
        } catch (parseError) {
          console.error("Lỗi khi parse JSON:", parseError);
          console.error("Chuỗi JSON bị lỗi:", row.products);
          return { id: row.id, username: row.username, products: [] };
        }
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách giỏ hàng:", error);
      throw error;
    }
  },
  
    getCartByUser: async (user_id) => {
        const [rows] = await db.query(`
          SELECT 
            cart.*, 
            products.product_name, 
            products.price, 
            products.image 
          FROM cart
          JOIN products ON cart.product_id = products.product_id
          WHERE cart.user_id = ?
        `, [user_id]);
        
        return rows;
      },
      

    addToCart: async (user_id, product_id, quantity) => {
        try {
          const [rows] = await db.query(
            `SELECT * FROM cart WHERE user_id = ? AND product_id = ?`,
            [user_id, product_id]
          );
      
          if (rows.length > 0) {
            // Nếu đã có, cập nhật số lượng
            const existingQuantity = rows[0].quantity;
            const newQuantity = existingQuantity + quantity;
      
            const [result] = await db.query(
              `UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?`,
              [newQuantity, user_id, product_id]
            );
      
            console.log('Cập nhật số lượng:', result);
            return rows[0].id; // hoặc result.insertId nếu cần
          } else {
            // Nếu chưa có, thêm mới
            const [result] = await db.query(
              `INSERT INTO cart(user_id, product_id, quantity) VALUES (?, ?, ?)`,
              [user_id, product_id, quantity]
            );
      
            console.log('Thêm mới sản phẩm vào giỏ hàng:', result);
            return result.insertId;
          }
        } catch (error) {
          console.error("Lỗi addToCart:", error);
          throw error; // để backend trả về lỗi cho frontend
        }
      },
      

      updateQuantity: async (cart_id, quantity) => {
        try {
          if (!cart_id || quantity === undefined) {
            throw new Error("Thiếu cart_id hoặc quantity");
          }
      
          const [result] = await db.query(
            `UPDATE cart SET quantity = ? WHERE cart_id = ?`,
            [quantity, cart_id]
          );
      
          return result.affectedRows;
        } catch (error) {
          console.error("Lỗi khi cập nhật số lượng cart:", error);
          throw error;
        }
      },
      


    deleteItem: async(cart_id)=>{
        const [result]=await db.query(
            `DELETE FROM cart WHERE cart_id=?`,
            [cart_id]
        );
        return result.affectedRows;
    },

    clearCart: async(user_id)=>{
        const [result]=await db.query(
            `DELETE FROM cart WHERE user_id=?`,
            [user_id]
        );
        return result.affectedRows;
    },
    clearCartByUserId: async (user_id) => {
      const connection = await db.getConnection();
      try {
          const [result] = await connection.execute(
              "DELETE FROM cart WHERE user_id = ?",
              [user_id]
          );

          console.log(`🛒 Giỏ hàng của user ${user_id} đã được xóa!`);
          return result.affectedRows;
      } catch (error) {
          console.error("❌ Lỗi khi xóa giỏ hàng:", error);
          throw error;
      } finally {
          if (connection) connection.release();
      }
  }
};
module.exports =Cart;