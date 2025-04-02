const express = require("express");
const { getAdmins, getAdminById, createAdmin, updateAdmin, deleteAdmin, register, login } = require("../controllers/adminController");
const router = express.Router();

router.get("/", getAdmins);
router.get("/:id", getAdminById);
router.post("/", createAdmin);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);
router.post("/register", register);
router.post("/login", login);

module.exports = router;
