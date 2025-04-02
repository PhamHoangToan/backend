const db = require("../config/db");

const Category = {
//   getAll: (callback) => {
//     const sql = "SELECT category_id, name FROM categories";
//     db.query(sql, (err, results) => {
//       if (err) return callback(err, null);
//       callback(null, results);
//     });
//   },
  getAll: async () => {
          const [rows] = await db.query("SELECT category_id, name FROM categories");
          return rows;
      },
};

module.exports = Category;
