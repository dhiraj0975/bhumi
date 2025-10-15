const db = require("../config/db");

const Category = {
  // Get all categories
  getAll: (callback) => {
    const sql = "SELECT * FROM categories";
    db.query(sql, callback);
  },

  // Create new category (default Active agar status nahi diya)
  create: (name, status = "Active", callback) => {
    const sql = "INSERT INTO categories (name, status) VALUES (?, ?)";
    db.query(sql, [name, status], callback);
  },

  // Update both name & status
  update: (id, name, status, callback) => {
    const sql = "UPDATE categories SET name = ?, status = ? WHERE id = ?";
    db.query(sql, [name, status, id], callback);
  },

  // Delete category
  delete: (id, callback) => {
    const sql = "DELETE FROM categories WHERE id = ?";
    db.query(sql, [id], callback);
  },

  // ✅ Update only status (Active/Inactive toggle)
  updateStatus: (id, status, callback) => {
    const sql = "UPDATE categories SET status = ? WHERE id = ?";
    db.query(sql, [status, id], callback);
  }
};

module.exports = Category;
