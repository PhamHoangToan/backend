const express=require("express");
const authenticateToken = require("../middlewares/authenticateToken") ;

const {getOrders, getAllOrders,getOrderDetails, getOrderById, createOrder, updateOrder, deleteOrder,getOrdersByUser,createFullOrder
    ,pPaymentMomo, callbackMomo, postTransactionStatus,updateOrderStatus,
    getOrdersByStatus,}=require("../controllers/orderController")


const router =express.Router();
router.get("/orders", getAllOrders);
router.get('/:orderId', getOrderDetails);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.post("/", authenticateToken, createOrder);
router.get("/orders/my-orders", authenticateToken, getOrdersByUser);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);
router.post('/orders/full', authenticateToken, createFullOrder);
router.put('/update-status/:orderId',updateOrderStatus);
router.get('/filter-by-status', getOrdersByStatus);
router.post("/payment", pPaymentMomo);
router.post("/callback", callbackMomo);
router.post("/transaction-status", postTransactionStatus);

module.exports = router;
