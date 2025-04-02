const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Bạn chưa đăng nhập!" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Lỗi verify token:", err);
      return res.status(403).json({ success: false, message: "Token không hợp lệ!" });
    }

    // user là object bạn gán lúc tạo token { user_id, email, ... }
    req.user = user;  
    next();
  });
};

module.exports = authenticateToken;
