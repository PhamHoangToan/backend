const db = require("../config/db");
const nodemailer = require("nodemailer");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

// Cấu hình email SMTP (chỉ khai báo một lần)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Đăng nhập
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Truy vấn người dùng từ database
        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(400).json({ success: false, message: "Email không tồn tại" });
        }

        const user = users[0]; // Lấy user đầu tiên
        const isMatch = bcrypt.compareSync(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Mật khẩu sai" });
        }

        // Tạo JWT token
        const token = jwt.sign({ user_id: user.user_id }, "SECRET_KEY", { expiresIn: "1d" });

        res.status(200).json({
            success: true,
            message: "Đăng nhập thành công",
            token: token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};

// Quên mật khẩu (gửi mã OTP qua email)
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Kiểm tra xem email có tồn tại không
        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: "Email không tồn tại" });
        }

        // Tạo mã OTP
        const resetCode = Math.floor(100000 + Math.random() * 900000);
        const resetExpire = new Date(Date.now() + 15 * 60 * 1000); // Hết hạn sau 15 phút

        // Cập nhật vào database
        await db.query("UPDATE users SET reset_code = ?, reset_expire = ? WHERE email = ?", [resetCode, resetExpire, email]);

        // Gửi email
        await transporter.sendMail({
            from: `"Support Team" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Password Reset Code",
            text: `Your password reset code is: ${resetCode}. It will expire in 15 minutes.`,
        });

        res.json({ success: true, message: "Reset code sent to email" });
    } catch (error) {
        res.status(500).json({ error: "Failed to send email", details: error.message });
    }
};

// Đặt lại mật khẩu
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Kiểm tra OTP
        const [users] = await db.query("SELECT * FROM users WHERE email = ? AND reset_code = ?", [email, otp]);
        if (users.length === 0) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const user = users[0];
        if (Date.now() > new Date(user.reset_expire).getTime()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        // Hash mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu mới và xóa mã OTP
        await db.query("UPDATE users SET password = ?, reset_code = NULL, reset_expire = NULL WHERE email = ?", [hashedPassword, email]);

        res.json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { forgotPassword, resetPassword, login };
