const User = require("../model/User");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { OAuth2Client } = require('google-auth-library');



const getUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.getById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, email, password, phone, address } = req.body;
    const userId = await User.create(username, email, password,phone, address);
    res.status(201).json({ id: userId, message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {

  const { username, email, password, phone, address } = req.body;
  const userId = req.params.id;

  try {
    // Log dữ liệu nhận được từ request
    console.log("📌 Dữ liệu nhận được:", { username, email, password, phone, address });

    // Cập nhật người dùng trong cơ sở dữ liệu
    const [updatedRows] = await db.execute(
      "UPDATE users SET username = ?, email = ?, password = ?, phone = ?, address = ? WHERE user_id = ?",
      [username, email, password, phone, address, userId]
    );

    // Kiểm tra nếu không có dòng nào được cập nhật
    if (updatedRows === 0) {
      console.log("🚫 Không có thay đổi nào hoặc người dùng không tồn tại");
      return res.status(404).json({ message: "User not found or no changes made" });
    }

    // Lấy lại thông tin người dùng đã được cập nhật
    const [updatedUser] = await db.execute(
      "SELECT * FROM users WHERE user_id = ?",
      [userId]
    );

    if (updatedUser.length === 0) {
      console.log("🚫 Không tìm thấy người dùng sau khi cập nhật");
      return res.status(404).json({ message: "User not found" });
    }

    // Log kết quả cập nhật
    console.log("✅ Người dùng đã được cập nhật:", updatedUser[0]);

    // Trả về kết quả
    res.json({ message: "User updated successfully", user: updatedUser[0] });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật người dùng:", error);
    res.status(500).json({ error: "Database update failed" });

  try {
    const { username, email,password,phone,address } = req.body;
    const updatedRows = await User.update(req.params.id, username, email,password, phone,address);
    if (!updatedRows) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
}

const deleteUser = async (req, res) => {
  try {
    const deletedRows = await User.delete(req.params.id);
    if (!deletedRows) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//
const getUserByToken = async (req, res) => {
  try {
    console.log("📢 User ID from token:", req.user.user_id); // Kiểm tra user_id từ token

    const user = await User.getById(req.user.user_id);
    console.log("🔎 User found:", user); // Kiểm tra user lấy từ DB

    if (!user) {
      console.log("❌ User not found in database");
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      phone: user.phone,
      address: user.address,
    });
  } catch (error) {
    console.error("❌ Error in getUserByToken:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateUserByToken = async (req, res) => {
  try {
    console.log("📥 Received request to update user by token");
    console.log("📌 Decoded user from token:", req.user);
    console.log("📌 Request body:", req.body);

    const { username, phone, address, currentPassword, newPassword } = req.body;
    const userId = req.user.user_id;

    // Lấy user từ database
    const user = await User.getById(userId);
    if (!user) {
      console.log("❌ User not found in database");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("👤 Existing user data:", user);

    let updatedPassword = user.password; // Giữ nguyên mật khẩu nếu không đổi

    // Nếu user muốn đổi mật khẩu, kiểm tra mật khẩu cũ
    if (currentPassword && newPassword) {
      console.log("🔑 User is changing password");

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        console.log("❌ Current password is incorrect");
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      updatedPassword = await bcrypt.hash(newPassword, 10);
      console.log("✅ New hashed password set");
    }

    // Chuẩn bị dữ liệu cập nhật (không có email)
    const updatedUser = {
      username: username?.trim() || user.username || null,
      phone: phone?.trim() || user.phone || null,
      address: address?.trim() || user.address || null,
      password: updatedPassword || user.password || null,
    };

    // Thực hiện cập nhật vào database
    const result = await User.update(userId, updatedUser);

    if (!result || typeof result.affectedRows === "undefined") {
      console.log("❌ Update function did not return a valid result");
      return res.status(500).json({ message: "Unexpected error during update" });
    }

    if (result.affectedRows === 0) {
      console.log("❌ Update failed, no rows affected");
      return res.status(400).json({ message: "No changes made" });
    }

    console.log("✅ User updated successfully:", updatedUser);
    res.json({ message: "User updated successfully" });

  } catch (error) {
    console.error("❌ Error updating user by token:", error);
    res.status(500).json({ error: error.message });
  }
};

//dang ky
const register = async (req, res) => {
  try {
    const { username, email, password, phone, address } = req.body;

    const existingUser = await User.getByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userID = await User.create(username, email, hashedPassword, phone, address);

    res.status(201).json({ success: true, id: userID, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


//dang nhap
const login=async(req, res)=>{
  try {
    const {email, password}=req.body;
    //kiem tra ton tai user
    const user=await User.getByEmail(email);
    if(!user){
      return res.status(400).json({message:"Invalid email or password"});
    }
    //kiem tra password
    const isMatch=await bcrypt.compare(password, user.password);
    if(!isMatch){
      return res.status(400).json({message:"Invalid email or password"})
    }

    //Tao JWT Token
    const token=jwt.sign({user_id: user.user_id, email: user.email}, process.env.JWT_SECRET, {expiresIn:"1h"});
    res.json({token, user:{id: user.user_id, username: user.username, email:user.email,address: user.address,   // cần thêm field này
      phone: user.phone }});
  } catch (error) {
    res.status(500).json({error:error.message});
  }
}


const clientId = process.env.GG_CLIENT_ID;
const client = new OAuth2Client(clientId);
async function verifyToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: clientId,
  });
  const payload = ticket.getPayload();
  return payload;
}
const googleLogin = async (req, res) => {
  try {

    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    // Verify Google token
    const payload = await verifyToken(token);
    if (!payload) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const { email, name, sub } = payload;
    
    // Check if user exists
    let account = await User.getByEmail(email);

    // If user does not exist, create a new one
    if (!account) {
      const hashedPassword = await bcrypt.hash(email, 10); // Hash email as a temporary password

      const userId = await User.create(
        name || email.split('@')[0], // Use name if available, otherwise extract from email
        email,
        hashedPassword, // Save hashed password
        '0', // Default phone number (consider setting NULL if not required)
        '' // Empty string for address if not available
      );

      account = await User.getById(userId); // Fetch the newly created user
    }

    // Generate JWT Token
    const tokenJWT = jwt.sign(
      { user_id: account.user_id, email: account.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    
    return res.status(200).json({
      success: true,
      token: tokenJWT,
      user: {
        user_id: account.user_id,
        username: account.username,
        email: account.email,
        phone: account.phone,
        address: account.address
      }
    });
  } catch (error) {
    console.error("Error in Google login:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};





module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser, register, login,getUserByToken, updateUserByToken, googleLogin }
