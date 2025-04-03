const db = require("../config/db");

const Admin = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM admin");
    return rows;
  },

  getById: async (admin_id) => {
    const [rows] = await db.query("SELECT * FROM admin WHERE admin_id = ?", [admin_id]);
    return rows[0];
  },

  getByEmail: async(email)=>{
    const [rows]=await db.query("SELECT * FROM admin WHERE email=?", [email]);
    return rows[0];
  },
   create: async (username, email, password) => {
      const [result] = await db.query(
        "INSERT INTO admin (name, email, password) VALUES (?, ?, ?)",
        [username, email, password]
      );
      return result.insertId;
    },
  

  update: async (id, name, email,password) => {
    const [result] = await db.query(
      "UPDATE admin SET name = ?, email = ?,password=? WHERE admin_id = ?",
      [name, email,password, id]
    );
    return result.affectedRows;
  },

  delete: async (admin_id) => {
    const [result] = await db.query("DELETE FROM admin WHERE admin_id = ?", [admin_id]);
    return result.affectedRows;
  },
};

module.exports = Admin;
