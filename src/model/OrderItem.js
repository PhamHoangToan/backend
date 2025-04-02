const db = require("../config/db");

// Lấy thông tin đơn hàng và thông tin user
const getOrderInfo = async (orderId) => {
  const [rows] = await db.query(`
    SELECT 
      o.order_id,
      o.status,
      o.payment,
      u.username,
      u.email,
      u.phone,
      u.address
    FROM orders o
    JOIN users u ON o.user_id = u.user_id
    WHERE o.order_id = ?
  `, [orderId]);

  return rows;
};

// Lấy các sản phẩm thuộc đơn hàng đó
const getOrderItems = async (orderId) => {
  const [rows] = await db.query(`
    SELECT 
      oi.order_item_id,
      oi.order_id,
      oi.product_id,
      p.product_name,
      p.image,
      oi.quantity,
      oi.price
    FROM order_item oi
    JOIN products p ON oi.product_id = p.product_id
    WHERE oi.order_id = ?
  `, [orderId]);

  return rows;
};
const createOrderItemsInDB = async (connection, order_id, items) => {
    try {
      const query = `
        INSERT INTO order_item (order_id, product_id, quantity, price)
        VALUES ?
      `;
  
      const values = items.map(item => [
        order_id,
        item.product_id,
        item.quantity,
        item.price
      ]);
  
      await connection.query(query, [values]);
    } catch (error) {
      console.error('Lỗi createOrderItemsInDB:', error);
      throw error;
    }
  };
  
  module.exports = {
    createOrderItemsInDB
  };

 
  
   
module.exports = {
  getOrderInfo,
  getOrderItems,
  createOrderItemsInDB,getAllOrdersFromDB
};
