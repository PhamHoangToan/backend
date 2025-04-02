const express = require("express");
const { forgotPassword, resetPassword,login } = require("../controllers/authController");
const router = express.Router();

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/login", login);
module.exports = router;
