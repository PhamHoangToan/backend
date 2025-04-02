const db = require("../config/db");
const Order={
    getAll: async () => {
        const [rows] = await db.query("SELECT * FROM orders");
        return rows;
    },

    getById: async (order_id) => {
        const [rows] = await db.query("SELECT * FROM orders WHERE order_id = ?", [order_id]);
        return rows[0];
    },

     create: async (connection, orderData) => {
        try {
          const {
            user_id,
            date,
            number,
            total_price,
            status,
            payment
          } = orderData;
      
          // Chuyển date thành kiểu MySQL DATETIME (nếu cần)
          const orderDate = date
            ? new Date(date).toISOString().slice(0, 19).replace('T', ' ')
            : new Date().toISOString().slice(0, 19).replace('T', ' ');
      
          const [result] = await connection.query(
            `INSERT INTO orders (user_id, date, number, total_price, status, payment) VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, orderDate, number, total_price, status, payment]
          );
      
          return result.insertId;
      
        } catch (error) {
          console.error('Lỗi create order:', error);
          throw error;
        }
      },
      
     
      



    findByUserId: async (user_id) => {
        console.log("Đang tìm order với user_id:", user_id);
        const [rows] = await db.query("SELECT * FROM orders WHERE user_id = ?", [user_id]);
        console.log("Kết quả rows:", rows);
        return rows;
      },
      
    update: async (order_id, user_id, date, number, total_price, status, payment) => {
        const [result] = await db.query(
            "UPDATE orders SET user_id = ?, date = ?, number = ?, total_price = ?, status = ?, payment = ? WHERE order_id = ?",
            [user_id, date, number, total_price, status, payment, order_id]
        );
        return result.affectedRows;
    },

    delete: async (order_id) => {
        const [result] = await db.query("DELETE FROM orders WHERE order_id = ?", [order_id]);
        return result.affectedRows;
    },
    get: getAllOrdersFromDB = async () => {
      const query = `
        SELECT 
           o.order_id, u.username AS username, u.phone, u.address,
          o.date, o.number, o.total_price, o.payment, o.status
        FROM orders o
        JOIN users u ON o.user_id = u.user_id
        ORDER BY o.date DESC;
      `;
      const [rows] = await db.execute(query);
      return rows;
    },
     getOrderById : async (orderId) => {
      try {
        const query = `
          SELECT 
            o.order_id, u.username AS username, u.phone, u.address,
            o.date, o.number, o.total_price, o.payment, o.status
          FROM orders o
          JOIN users u ON o.user_id = u.user_id
          WHERE o.order_id = ?`;  // Sử dụng truy vấn có tham số để bảo mật
    
        // Thực thi truy vấn
        const [rows] = await db.execute(query, [orderId]);
    
        // Log ra rows để kiểm tra dữ liệu trả về
        console.log('Dữ liệu đơn hàng:', rows);
    
        if (rows.length === 0) {
          console.log(`Không tìm thấy đơn hàng với ID ${orderId}`);
          return null;  // Nếu không có đơn hàng, trả về null
        }
    
        return rows[0];  // Trả về đơn hàng đầu tiên
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu đơn hàng:", error);
        throw error;  // Propagate lỗi để controller xử lý
      }
    },
    
};

module.exports = Order;