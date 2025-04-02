const db = require("../config/db");
const bcrypt = require('bcryptjs');
const User = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM users");
    return rows;
  },

  getById: async (user_id) => {
    const [rows] = await db.query("SELECT * FROM users WHERE user_id = ?", [user_id]);
    return rows[0];
  },

  getByEmail: async(email)=>{
    const [rows]=await db.query("SELECT * FROM users WHERE email=?", [email]);
    return rows[0];
  },

  create: async (username, email, password, phone, address) => {
    const [result] = await db.query(
      "INSERT INTO users (username, email, password, phone, address) VALUES (?, ?, ?, ? , ?)",
      [username, email, password,phone, address]
    );
    return result.insertId;
  },

   updateUser : async (req, res) => {
    const { username, email, password, phone, address } = req.body;
  
    // Prepare the query
    const query = `
      UPDATE users
      SET username = ?, email = ?, password = ?, phone = ?, address = ?
      WHERE user_id = ?
    `;
  
    try {
      const [result] = await db.execute(query, [username, email, password, phone, address, req.params.id]);
  
      // Check if any rows were affected
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json({ message: "User updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  



  update: async (userId, updatedData) => {
    try {
      const { username, password, phone, address } = updatedData;
  
      const values = [
        username || null,
        password || null,
        phone || null,
        address || null,
        userId
      ];
  
      console.log("📌 SQL values before update:", values);
  
      const [result] = await db.execute(
        "UPDATE users SET username = ?, password = ?, phone = ?, address = ? WHERE user_id = ?",
        values
      );
  
      console.log("✅ Update result:", result);
      return result;
    } catch (error) {
      console.error("❌ Error in User.update:", error);
      throw new Error("Database update failed");
    }
  },
  
  
  verifyPassword: async (hashedPassword, inputPassword) => {
    return await bcrypt.compare(inputPassword, hashedPassword);
  },

  updatePassword: async (user_id, newPassword) => {
    await db.query("UPDATE users SET password = ? WHERE user_id = ?", [newPassword, user_id]);
  },

  delete: async (user_id) => {
    const [result] = await db.query("DELETE FROM users WHERE user_id = ?", [user_id]);
    return result.affectedRows;
  },

  hashPassword: async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  },
};

module.exports = User;
