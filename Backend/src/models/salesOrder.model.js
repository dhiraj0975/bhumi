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

const SalesOrder = {
  create: async (data) => {
    const sql = `
      INSERT INTO \`sales_orders\`
      (\`so_no\`, \`customer_id\`, \`date\`, \`bill_time\`, \`address\`, \`mobile_no\`, \`gst_no\`,
       \`place_of_supply\`, \`terms_condition\`, \`total_amount\`, \`gst_amount\`, \`final_amount\`, \`status\`)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.so_no || "",
      toNum(data.customer_id),
      data.date || null,          // 'YYYY-MM-DD'
      data.bill_time || null,     // 'YYYY-MM-DD HH:MM:SS'
      data.address || "",
      data.mobile_no || "",
      data.gst_no || "",
      data.place_of_supply || "",
      data.terms_condition || "",
      toNum(data.total_amount),
      toNum(data.gst_amount),
      toNum(data.final_amount),
      data.status || "Draft",
    ];
    const [res] = await q(sql, values);
    return res;
  },

  // Flattened raw rows for grouping on server
  getAllRaw: async () => {
    const sql = `
      SELECT
        so.\`id\` AS \`sales_order_id\`,
        so.\`so_no\`,
        so.\`date\`,
        so.\`bill_time\`,
        c.\`name\` AS \`customer_name\`,
        so.\`address\`,
        so.\`mobile_no\`,
        so.\`gst_no\`,
        so.\`place_of_supply\`,
        so.\`terms_condition\`,
        so.\`total_amount\`  AS \`order_total\`,
        so.\`gst_amount\`    AS \`order_gst\`,
        so.\`final_amount\`  AS \`order_final\`,
        so.\`status\`,

        soi.\`id\`          AS \`item_id\`,
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
        soi.\`gst_amount\`   AS \`item_gst\`,
        soi.\`final_amount\` AS \`item_final\`
      FROM \`sales_orders\` so
      JOIN \`customers\` c ON c.\`id\` = so.\`customer_id\`
      JOIN \`sales_order_items\` soi ON soi.\`sales_order_id\` = so.\`id\`
      JOIN \`products\` p ON p.\`id\` = soi.\`product_id\`
      ORDER BY so.\`id\` DESC, soi.\`id\` ASC
    `;
    const [rows] = await q(sql);
    return rows;
  },

  getById: async (id) => {
    const sql = `SELECT * FROM \`sales_orders\` WHERE \`id\` = ?`;
    const [rows] = await q(sql, [toNum(id)]);
    return rows;
  },

  updateHeader: async (id, data) => {
    const sql = `
      UPDATE \`sales_orders\` SET
        \`so_no\` = ?,
        \`customer_id\` = ?,
        \`date\` = ?,
        \`bill_time\` = ?,
        \`address\` = ?,
        \`mobile_no\` = ?,
        \`gst_no\` = ?,
        \`place_of_supply\` = ?,
        \`terms_condition\` = ?,
        \`total_amount\` = ?,
        \`gst_amount\` = ?,
        \`final_amount\` = ?,
        \`status\` = ?
      WHERE \`id\` = ?
    `;
    const values = [
      data.so_no || "",
      toNum(data.customer_id),
      data.date || null,
      data.bill_time || null,
      data.address || "",
      data.mobile_no || "",
      data.gst_no || "",
      data.place_of_supply || "",
      data.terms_condition || "",
      toNum(data.total_amount),
      toNum(data.gst_amount),
      toNum(data.final_amount),
      data.status || "Issued",
      toNum(id),
    ];
    const [res] = await q(sql, values);
    return res;
  },

  delete: async (id) => {
    const sql = `DELETE FROM \`sales_orders\` WHERE \`id\` = ?`;
    const [res] = await q(sql, [toNum(id)]);
    return res;
  },

  // Add this method in SalesOrder model
  getByIdWithCustomer: async (id) => {
    const sql = `
      SELECT
        so.\`id\`,
        so.\`so_no\`,
        so.\`date\`,
        so.\`bill_time\`,
        so.\`address\`,
        so.\`mobile_no\`,
        so.\`gst_no\`,
        so.\`place_of_supply\`,
        so.\`terms_condition\`,
        so.\`total_amount\`,
        so.\`gst_amount\`,
        so.\`final_amount\`,
        so.\`status\`,
        c.\`name\` AS \`customer_name\`
      FROM \`sales_orders\` so
      JOIN \`customers\` c ON c.\`id\` = so.\`customer_id\`
      WHERE so.\`id\` = ?
      LIMIT 1
    `;
    const [rows] = await q(sql, [toNum(id)]);
    return rows;
  },

};

module.exports = SalesOrder;
