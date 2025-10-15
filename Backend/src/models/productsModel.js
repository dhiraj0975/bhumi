  // const db = require("../config/db");

  // const Product = {
  //   create: (data, cb) => {
  //     const sql = `
  //       INSERT INTO products
  //       (category_id, product_name, size, purchase_rate, transport_charge, local_transport, packaging_cost, packing_weight, hsn_code, value, discount_30, discount_25, discount_50, total, gst)
  //       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  //     `;
  //     db.query(sql, [
  //       data.category_id,
  //       data.product_name,
  //       data.size,
  //       data.purchase_rate,
  //       data.transport_charge,
  //       data.local_transport,
  //       data.packaging_cost,
  //       data.packing_weight,
  //       data.hsn_code,
  //       data.value,
  //       data.discount_30,
  //       data.discount_25,
  //       data.discount_50,
  //       data.total,
  //       data.gst
  //     ], cb);
  //   },

  //   getAll: (cb) => {
  //     const sql = `
  //       SELECT p.*, c.name AS category_name
  //       FROM products p
  //       JOIN categories c ON p.category_id = c.id
  //       ORDER BY c.name, p.product_name
  //     `;
  //     db.query(sql, cb);
  //   },

  //   getById: (id, cb) => {
  //     const sql = `
  //       SELECT p.*, c.name AS category_name
  //       FROM products p
  //       JOIN categories c ON p.category_id = c.id
  //       WHERE p.id = ?
  //     `;
  //     db.query(sql, [id], cb);
  //   },

  //   update: (id, data, cb) => {
  //     const sql = `
  //       UPDATE products SET 
  //       category_id=?, product_name=?, size=?, purchase_rate=?, transport_charge=?, local_transport=?, packaging_cost=?, packing_weight=?, hsn_code=?, value=?, discount_30=?, discount_25=?, discount_50=?, total=?, gst=?
  //       WHERE id=?
  //     `;
  //     db.query(sql, [
  //       data.category_id,
  //       data.product_name,
  //       data.size,
  //       data.purchase_rate,
  //       data.transport_charge,
  //       data.local_transport,
  //       data.packaging_cost,
  //       data.packing_weight,
  //       data.hsn_code,
  //       data.value,
  //       data.discount_30,
  //       data.discount_25,
  //       data.discount_50,
  //       data.total,
  //       data.gst,
  //       id
  //     ], cb);
  //   },

  //   delete: (id, cb) => {
  //     const sql = "DELETE FROM products WHERE id=?";
  //     db.query(sql, [id], cb);
  //   }
  // };

  // module.exports = Product;



  // models/productsModel.js
const db = require("../config/db");

const Product = {
  create: (data, cb) => {
    const sql = `
      INSERT INTO products
      (category_id, product_name, size, purchase_rate, transport_charge, local_transport, packaging_cost, packing_weight, hsn_code, value, discount_30, discount_25, discount_50, total, gst)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [
      data.category_id,
      data.product_name,
      data.size,
      data.purchase_rate,
      data.transport_charge,
      data.local_transport,
      data.packaging_cost,
      data.packing_weight,
      data.hsn_code,
      data.value,
      data.discount_30,
      data.discount_25,
      data.discount_50,
      data.total,
      data.gst
    ], cb);
  },

  getAll: (cb) => {
    const sql = `
      SELECT p.*, c.name AS category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY c.name, p.product_name
    `;
    db.query(sql, cb);
  },

  getById: (id, cb) => {
    const sql = `
      SELECT p.*, c.name AS category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;
    db.query(sql, [id], cb);
  },

  // DYNAMIC PARTIAL UPDATE: only set provided fields
  update: (id, data, cb) => {
    const fields = [
      "category_id","product_name","size","purchase_rate","transport_charge",
      "local_transport","packaging_cost","packing_weight","hsn_code","value",
      "discount_30","discount_25","discount_50","total","gst"
    ];
    const sets = [];
    const vals = [];
    fields.forEach((f) => {
      if (Object.prototype.hasOwnProperty.call(data, f)) {
        sets.push(`${f} = ?`);
        vals.push(data[f]);
      }
    });
    if (!sets.length) return cb(null, { affectedRows: 0 });

    const sql = `UPDATE products SET ${sets.join(", ")} WHERE id = ?`;
    vals.push(id);
    db.query(sql, vals, cb);
  },

  delete: (id, cb) => {
    const sql = "DELETE FROM products WHERE id=?";
    db.query(sql, [id], cb);
  }
};

module.exports = Product;
