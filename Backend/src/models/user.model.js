const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  async create({ username, password, full_name }) {
    const hash = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO users (username, password_hash, full_name) VALUES (?, ?, ?)`,
        [username, hash, full_name || null],
        (err, res) => (err ? reject(err) : resolve(res))
      );
    });
  },

  async findByUsername(username) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT id, username, password_hash, full_name FROM users WHERE username = ?`, [username], (err, rows) => {
        if (err) return reject(err);
        return resolve((rows || [])[0] || null);
      });
    });
  },
};

module.exports = User;
