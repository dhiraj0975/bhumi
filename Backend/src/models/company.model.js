const db = require('../config/db');
function q(sql, params=[]) {
  return new Promise((resolve, reject) => db.query(sql, params, (e, rows)=> e?reject(e):resolve(rows)));
}
module.exports = {
  async create({ code, name, address=null, gst_no=null, contact_no=null, email=null, owner_name=null }) {
    await q(
      `INSERT INTO companies (code, name, address, gst_no, contact_no, email, owner_name, status)
       VALUES (?,?,?,?,?,?,?,'Active')`,
      [code, name, address, gst_no, contact_no, email, owner_name]
    );
    return { code };
  },
  async list(){ return await q(`SELECT * FROM companies ORDER BY id DESC`); }
};
