const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const { getUsers, getUserById, createUser, updateUser, deleteUser, register, login,getUserByToken,updateUserByToken,googleLogin } = require("../controllers/userController");



const router = express.Router();
router.get("/me", (req, res, next) => {
    console.log("🚀 Route /me được gọi");
    next();
  }, authenticateToken, getUserByToken);
  
  router.put("/update", (req, res, next) => {
    console.log("🚀 [ROUTE] /update được gọi");
    next();
  }, authenticateToken, updateUserByToken);
  
router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/register", register);
router.post("/login", login);

router.post("/gg", googleLogin);




module.exports = router;
