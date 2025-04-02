const express=require("express");
const authenticateToken = require("../middlewares/authenticateToken") ;

const {getOrders, getAllOrders,getOrderDetails, getOrderById, createOrder, updateOrder, deleteOrder,getOrdersByUser,createFullOrder,pPaymentMomo, callbackMomo, postTransactionStatus,}=require("../controllers/orderController")


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

router.post("/payment", pPaymentMomo);
router.post("/callback", callbackMomo);
router.post("/transaction-status", postTransactionStatus);

module.exports = router;
