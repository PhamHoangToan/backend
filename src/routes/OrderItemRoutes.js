const express = require('express');
const router = express.Router();
const { getOrderDetail } = require('../controllers/OrderItemController');
const authenticateToken = require('../middlewares/authenticateToken'); // nếu cần xác thực

// API lấy chi tiết đơn hàng

router.get('/order-detail',  getOrderDetail);
router.get('/orders/order-detail', authenticateToken, getOrderDetail);




module.exports = router;
