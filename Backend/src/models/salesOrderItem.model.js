const db = require("../config/db");

// number helper
const toNum = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

// safe query wrapper with context
const q = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        err.query = sql;
        err.params = params;
        return reject(err);
      }
      resolve([results]);
    });
  });

const SalesOrderItem = {
  // INSERT only base fields; generated columns DB me auto-calc honge
  create: async (data) => {
    const sql = `
      INSERT INTO \`sales_order_items\`
      (\`sales_order_id\`, \`product_id\`, \`hsn_code\`, \`qty\`, \`rate\`, \`discount_per_qty\`, \`gst_percent\`, \`status\`)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      toNum(data.sales_order_id),
      toNum(data.product_id),
      data.hsn_code || "",
      toNum(data.qty),
      toNum(data.rate),
      toNum(data.discount_per_qty),
      toNum(data.gst_percent),
      data.status || "Active",
    ];
    const [res] = await q(sql, values);
    return res;
  },

  // Items by Sales Order Id, product_name join ke saath
  getBySOId: async (id) => {
    const sql = `
      SELECT
        soi.\`id\`,
        soi.\`sales_order_id\`,
        soi.\`product_id\`,
        p.\`product_name\`,
        soi.\`hsn_code\`,
        soi.\`qty\`,
        soi.\`rate\`,
        soi.\`amount\`,
        soi.\`discount_per_qty\`,
        soi.\`discount_rate\`,
        soi.\`discount_total\`,
        soi.\`gst_percent\`,
        soi.\`gst_amount\`,
        soi.\`final_amount\`,
        soi.\`status\`,
        soi.\`created_at\`,
        soi.\`updated_at\`
      FROM \`sales_order_items\` soi
      JOIN \`products\` p ON p.\`id\` = soi.\`product_id\`
      WHERE soi.\`sales_order_id\` = ?
      ORDER BY soi.\`id\` ASC
    `;
    const [rows] = await q(sql, [toNum(id)]);
    return rows;
  },

  // Update editable fields only; generated columns DB khud compute karega
  update: async (id, data) => {
    const sql = `
      UPDATE \`sales_order_items\` SET
        \`product_id\` = ?,
        \`hsn_code\` = ?,
        \`qty\` = ?,
        \`rate\` = ?,
        \`discount_per_qty\` = ?,
        \`gst_percent\` = ?,
        \`status\` = ?
      WHERE \`id\` = ?
    `;
    const values = [
      toNum(data.product_id),
      data.hsn_code || "",
      toNum(data.qty),
      toNum(data.rate),
      toNum(data.discount_per_qty),
      toNum(data.gst_percent),
      data.status || "Active",
      toNum(id),
    ];
    const [res] = await q(sql, values);
    return res;
  },

  // Puray SO ke items delete
  deleteBySOId: async (soId) => {
    const sql = `DELETE FROM \`sales_order_items\` WHERE \`sales_order_id\` = ?`;
    const [res] = await q(sql, [toNum(soId)]);
    return res;
  },
};

module.exports = SalesOrderItem;
