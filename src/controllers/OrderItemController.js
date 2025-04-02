const { getOrderInfo, getOrderItems } = require('../model/OrderItem');

const getOrderDetail = async (req, res) => {
  const orderId = req.query.order_id;

  if (!orderId) {
    return res.status(400).json({ success: false, message: "Thiếu order_id" });
  }

  try {
    console.log("Đang lấy chi tiết đơn hàng với order_id:", orderId);

    // Lấy thông tin đơn hàng và khách hàng
    const orderInfo = await getOrderInfo(orderId);

    if (orderInfo.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    // Lấy chi tiết sản phẩm
    const orderItems = await getOrderItems(orderId);

    // Kết hợp data vào từng sản phẩm
    const orderDetail = orderItems.map(item => ({
      ...item,
      username: orderInfo[0].username,
      email: orderInfo[0].email,
      phone: orderInfo[0].phone,
      address: orderInfo[0].address,
      payment: orderInfo[0].payment,
      status: orderInfo[0].status
    }));

    console.log("Chi tiết đơn hàng:", orderDetail);

    res.json({
      success: true,
      order: orderDetail
    });

  } catch (error) {
    console.error("Lỗi lấy chi tiết đơn hàng:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};


module.exports = {
  getOrderDetail
};
