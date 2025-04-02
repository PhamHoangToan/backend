const Order =require("../model/Order")
const OrderItem =require("../model/OrderItem")
const db = require('../config/db');
const Cart=require("../model/Cart")

const getAllOrders = async (req, res) => {
  try {
    const orders = await getAllOrdersFromDB(); // Hàm này lấy tất cả đơn hàng từ DB
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Lỗi lấy danh sách đơn hàng:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const getOrders = async (req, res) => {
    try {
        const orders = await Order.getAll();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.getById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createOrder = async (req, res) => {
    try {
      const user_id = req.user.user_id; // <-- user_id lấy từ token đã decode
      const { date, number, total_price, status, payment } = req.body;
  
      if (!user_id || !total_price) {
        return res.status(400).json({ success: false, message: "Thiếu thông tin đơn hàng" });
      }
  
      const order_id = await Order.create(user_id, date, number, total_price, status, payment);
  
      res.status(201).json({
        success: true,
        id: order_id,
        message: "Order created successfully"
      });
  
    } catch (error) {
      console.error("Lỗi khi tạo order:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  };




  const createFullOrder = async (req, res) => {
    const connection = await db.getConnection();
  
    try {
      const user_id = req.user.user_id;
      const { date, number, total_price, status, payment, items } = req.body;
  
      if (!user_id || !total_price || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: "Thiếu thông tin hoặc danh sách sản phẩm rỗng!" });
      }
  
      await connection.beginTransaction();
  
      // CHỈNH LẠI: GỌI createOrder ĐÚNG THAM SỐ
      const order_id = await Order.create(connection, {
        user_id,
        date,
        number,
        total_price,
        status,
        payment
      });
  
      // GỌI createOrderItems TỪ OrderItemModel
      await OrderItem.createOrderItemsInDB(connection, order_id, items);
      await Cart.clearCartByUserId(user_id);
      await connection.commit();
  
      res.status(201).json({
        success: true,
        order_id,
        message: 'Tạo đơn hàng và chi tiết đơn hàng thành công!'
      });
  
    } catch (error) {
      console.error('Lỗi tạo đơn hàng:', error);
      if (connection) await connection.rollback();
  
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi tạo đơn hàng',
        error: error.message
      });
    } finally {
      if (connection) connection.release();
    }
  };
  

const updateOrder = async (req, res) => {
    try {
        const { user_id, date, number, total_price, status, payment } = req.body;
        const updateRows = await Order.update(req.params.id, user_id, date, number, total_price, status, payment);
        
        if (updateRows === 0) return res.status(404).json({ message: "Order not found" });
        
        res.json({ message: "Order updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const deleteRows = await Order.delete(req.params.id);
        
        if (deleteRows === 0) return res.status(404).json({ message: "Order not found" });
        
        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getOrdersByUser = async (req, res) => {
    try {
      console.log("req.user:", req.user);
  
      const user_id = req.user.user_id; // lấy user_id từ token
      console.log("user_id từ token:", user_id);
  
      // Tìm đơn hàng theo user_id
      const orders = await Order.findByUserId(user_id);
      if (!orders) {
        console.log("Không tìm thấy đơn hàng cho user:", user_id);
      } else {
        console.log("Danh sách đơn hàng:", orders);
      }
      console.log("orders:", orders);
  
      if (!orders || orders.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "Không tìm thấy đơn hàng nào" 
        });
      }
  
      // ✅ Trả đơn hàng về cho frontend
      res.json({ 
        success: true, 
        data: orders  // <-- Chú ý key "data" để frontend nhận đúng
      });
  
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng người dùng:", error);
      res.status(500).json({ 
        success: false, 
        message: "Lỗi server" 
      });
    }
  };


  const updateOrderStatus = (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
  
    const validStatuses = ['Đang xử lý', 'Đang giao', 'Đã giao', 'Hủy bỏ'];
  
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }
  
    Order.updateOrderStatus(orderId, status, (err, results) => {
      if (err) {
        console.error('Error updating order status:', err);
        return res.status(500).json({ message: 'Lỗi server' });
      }
  
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
      }
  
      res.json({ message: 'Trạng thái đơn hàng đã được cập nhật' });
    });
  };
  
  // Controller to get orders filtered by status
  const getOrdersByStatus = (req, res) => {
    const { status } = req.query;
  
    // Nếu status là 'Tất cả', không lọc theo trạng thái
    if (status === "Tất cả") {
      Order.getAll((err, orders) => {
        if (err) {
          console.error('Lỗi khi lấy đơn hàng:', err);
          return res.status(500).json({ message: 'Lỗi server' });
        }
        res.json({ orders });
      });
    } else {
      Order.getOrdersByStatus(status, (err, orders) => {
        if (err) {
          console.error('Lỗi khi lấy đơn hàng:', err);
          return res.status(500).json({ message: 'Lỗi server' });
        }
        res.json({ orders });
      });
    }
  };
  
  var accessKey = "F8BBA842ECF85";
var secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
const pPaymentMomo = async (req, res) => {
  //https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
  //parameters
  const { orderData } = req.body;

  var orderInfo = "pay with MoMo";
  var partnerCode = "MOMO";
  var redirectUrl = "https://frontend-self-zeta-26.vercel.app";
  var ipnUrl =
    "https://backend-web-six.vercel.app/api/order/transaction-status";
  var requestType = "payWithMethod";
  var amount = orderData.total_price*1000;
  
  var orderId = partnerCode + new Date().getTime();
  var requestId = orderId;
  var extraData = JSON.stringify({ orderData });
  var paymentCode =
    "T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==";
  var orderGroupId = "";
  var autoCapture = true;
  var lang = "vi";

  //before sign HMAC SHA256 with format
  //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
  var rawSignature =
    "accessKey=" +
    accessKey +
    "&amount=" +
    amount +
    "&extraData=" +
    extraData +
    "&ipnUrl=" +
    ipnUrl +
    "&orderId=" +
    orderId +
    "&orderInfo=" +
    orderInfo +
    "&partnerCode=" +
    partnerCode +
    "&redirectUrl=" +
    redirectUrl +
    "&requestId=" +
    requestId +
    "&requestType=" +
    requestType;
  //puts raw signature
  console.log("--------------------RAW SIGNATURE----------------");
  console.log(rawSignature);
  //signature
  var signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");
  console.log("--------------------SIGNATURE----------------");
  console.log(signature);

  //json object send to MoMo endpoint
  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    partnerName: "Test",
    storeId: "MomoTestStore",
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    lang: lang,
    requestType: requestType,
    autoCapture: autoCapture,
    extraData: extraData,
    orderGroupId: orderGroupId,
    signature: signature,
  });

  const options = {
    url: "https://test-payment.momo.vn/v2/gateway/api/create",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
    data: requestBody,
  };
  let result;
  try {
    result = await axios(options);
    return res.status(200).json(result.data);
  } catch {
    return res.status(500).json({
      statusCode: 500,
      message: "momo error",
    });
  }
};

const callbackMomo = async (req, res) => {
  return res.status(200).json(req.body);
};

const postTransactionStatus = async (req, res) => {
  const { orderId, extraData } = req.body;

  const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = JSON.stringify({
    partnerCode: "MOMO",
    requestId: orderId,
    orderId: orderId,
    signature: signature,
    lang: "vi",
  });

  const options = {
    url: "https://test-payment.momo.vn/v2/gateway/api/query",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: requestBody,
  };

  try {
    let result = await axios(options);

    if (result.data.resultCode === 0) {
      // Tạo đơn hàng chính thức trong DB
      const { orderData } = JSON.parse(result.data.extraData);
      const orderBody = {
        user_id: orderData.user_id,
        date: new Date().toISOString().slice(0, 10),
        number: orderData.items.length,
        total_price: orderData.total_price,
        status: "Đang xử lý",
        payment: orderData.payment,
        items: orderData.items,
      };

      const response = await createFullOrder(
        { body: orderBody, user: { user_id: orderData.user_id } },
        res
      );
      return;
    }

    return res
      .status(400)
      .json({ success: false, message: "Thanh toán không thành công." });
  } catch (error) {
    console.error("Lỗi truy vấn trạng thái giao dịch:", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống." });
  }
};

const getOrderDetails = async (req, res) => {
  const { orderId } = req.params;

  try {
    const orderDetails = await Order.getOrderById(orderId);

    if (!orderDetails) {
      return res.status(404).json({ message: `Không tìm thấy đơn hàng với ID ${orderId}` });
    }

    res.status(200).json({ order: orderDetails });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

module.exports = { getOrders, getOrderById, createOrder, updateOrder, deleteOrder, getOrdersByUser,createFullOrder,pPaymentMomo,
  callbackMomo,
  postTransactionStatus,getAllOrders,getOrderDetails,updateOrderStatus,
  getOrdersByStatus,  };

