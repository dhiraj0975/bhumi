const db = require("../config/db");

// Helpers
const toNum = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

// Promise wrapper for callback-style db.query
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

const PurchaseOrderItem = {
  // Create single PO item
create: async (data) => {
  const poId = toNum(data.purchase_order_id, NaN);
  const productId = toNum(data.product_id, NaN);
  if (!Number.isInteger(poId)) throw new Error("purchase_order_id must be a valid integer");
  if (!Number.isInteger(productId)) throw new Error("product_id must be a valid integer");

  // REMOVE generated columns: amount, discount_rate, discount_total, gst_amount, final_amount
  const sql = `
    INSERT INTO purchase_order_items
    (purchase_order_id, product_id, hsn_code, qty, rate, discount_per_qty, gst_percent, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    poId,
    productId,
    data.hsn_code || "",
    toNum(data.qty),
    toNum(data.rate),
    toNum(data.discount_per_qty),
    toNum(data.gst_percent),
    data.status || "Active",
  ];
  const [result] = await q(sql, values);
  return result;
},


  // Bulk create items for a PO
  bulkCreate: async (purchase_order_id, items = []) => {
    const poId = toNum(purchase_order_id, NaN);
    if (!Number.isInteger(poId)) throw new Error("purchase_order_id must be a valid integer");
    if (!Array.isArray(items) || items.length === 0) return { affectedRows: 0 };

   const sql = `
  INSERT INTO purchase_order_items
  (purchase_order_id, product_id, hsn_code, qty, rate, discount_per_qty, gst_percent, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

    let affectedRows = 0;
    for (const it of items) {
      const productId = toNum(it.product_id, NaN);
      if (!Number.isInteger(productId)) throw new Error("product_id must be a valid integer");
     const values = [
  poId,
  productId,
  it.hsn_code || "",
  toNum(it.qty),
  toNum(it.rate),
  toNum(it.discount_per_qty),
  toNum(it.gst_percent),
  it.status || "Active",
];
      const [res] = await q(sql, values);
      affectedRows += res.affectedRows || 0;
    }
    return { affectedRows };
  },

  // Get items by PO id
  getByPOId: async (purchase_order_id) => {
    const poId = toNum(purchase_order_id, NaN);
    if (!Number.isInteger(poId)) throw new Error("purchase_order_id must be a valid integer");
    const sql = `
      SELECT poi.*, p.product_name
      FROM purchase_order_items poi
      JOIN products p ON p.id = poi.product_id
      WHERE poi.purchase_order_id = ?
      ORDER BY poi.id ASC
    `;
    const [rows] = await q(sql, [poId]);
    return rows;
  },

  // Get single item by id
  getById: async (id) => {
    const itemId = toNum(id, NaN);
    if (!Number.isInteger(itemId)) throw new Error("item id must be a valid integer");
    const [rows] = await q(`SELECT * FROM purchase_order_items WHERE id = ?`, [itemId]);
    return rows;
  },

  // Update single item
update: async (id, data) => {
  const itemId = toNum(id, NaN);
  if (!Number.isInteger(itemId)) throw new Error("item id must be a valid integer");
  if (!data.product_id) throw new Error("product_id is required for updating purchase_order_items");

  // REMOVE generated columns from SET
  const sql = `
    UPDATE purchase_order_items SET
      product_id = ?, hsn_code = ?, qty = ?, rate = ?,
      discount_per_qty = ?, gst_percent = ?, status = ?
    WHERE id = ?
  `;
  const values = [
    toNum(data.product_id),
    data.hsn_code || "",
    toNum(data.qty),
    toNum(data.rate),
    toNum(data.discount_per_qty),
    toNum(data.gst_percent),
    data.status || "Active",
    itemId,
  ];
  const [result] = await q(sql, values);
  return result;
},


  // Delete all items for a PO
  deleteByPOId: async (purchase_order_id) => {
    const poId = toNum(purchase_order_id, NaN);
    if (!Number.isInteger(poId)) throw new Error("purchase_order_id must be a valid integer");
    const [result] = await q(`DELETE FROM purchase_order_items WHERE purchase_order_id = ?`, [poId]);
    return result;
  },

  // Delete single item
  deleteById: async (id) => {
    const itemId = toNum(id, NaN);
    if (!Number.isInteger(itemId)) throw new Error("item id must be a valid integer");
    const [result] = await q(`DELETE FROM purchase_order_items WHERE id = ?`, [itemId]);
    return result;
  },
};

module.exports = PurchaseOrderItem;
