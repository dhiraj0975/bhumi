const db = require("../config/db");

// Small helper to coerce numbers safely
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
      resolve([results]); // keep [rows] or [result] shape
    });
  });

// Transaction helpers for callback connection
const getConn = () =>
  new Promise((resolve, reject) => {
    if (typeof db.getConnection !== "function") {
      // createConnection does not have getConnection; fallback to same connection
      return resolve(db);
    }
    db.getConnection((err, conn) => (err ? reject(err) : resolve(conn)));
  });

const begin = (conn) =>
  new Promise((resolve, reject) => {
    if (!conn.beginTransaction) return resolve();
    conn.beginTransaction((err) => (err ? reject(err) : resolve()));
  });

const exec = (conn, sql, params = []) =>
  new Promise((resolve, reject) => {
    conn.query(sql, params, (err, results) => (err ? reject(err) : resolve([results])));
  });

const commit = (conn) =>
  new Promise((resolve, reject) => {
    if (!conn.commit) return resolve();
    conn.commit((err) => (err ? reject(err) : resolve()));
  });

const rollback = (conn) =>
  new Promise((resolve) => {
    if (!conn.rollback) return resolve();
    conn.rollback(() => resolve());
  });

const release = (conn) => {
  if (typeof conn.release === "function") conn.release();
};

const PurchaseOrder = {
  // CREATE header
// Replace existing create with:
create: async (data) => {
  const sql = `
    INSERT INTO purchase_orders
    (po_no, party_type, vendor_id, farmer_id, date, bill_time, address, mobile_no, gst_no, place_of_supply, terms_condition, total_amount, gst_amount, final_amount, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  // Do NOT coerce null to number; allow nulls
  const values = [
    data.po_no || "",
    data.party_type || "vendor",
    data.vendor_id ?? null,
    data.farmer_id ?? null,
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
  ];
  const [result] = await q(sql, values);
  return result;
},


  // READ: list rows joined with vendor+items+products (flat)
  getAllRaw: async () => {
    const sql = `
      SELECT 
        po.id AS purchase_order_id,
        po.po_no,
        po.date,
        po.bill_time,
        v.firm_name AS vendor_name,
        po.address,
        po.mobile_no,
        po.gst_no,
        po.place_of_supply,
        po.terms_condition,
        po.total_amount AS order_total,
        po.gst_amount AS order_gst,
        po.final_amount AS order_final,
        po.status,

        poi.id AS item_id,
        poi.product_id,
        p.product_name,
        poi.hsn_code,
        poi.qty,
        poi.rate,
        poi.amount,
        poi.discount_per_qty,
        poi.discount_rate,
        poi.discount_total,
        poi.gst_percent,
        poi.gst_amount AS item_gst,
        poi.final_amount AS item_final
      FROM purchase_orders po
      JOIN vendors v ON v.id = po.vendor_id
      JOIN purchase_order_items poi ON poi.purchase_order_id = po.id
      JOIN products p ON p.id = poi.product_id
      ORDER BY po.id DESC, poi.id ASC
    `;
    const [rows] = await q(sql);
    return rows;
  },

  // READ: header only
  getById: async (id) => {
    const [rows] = await q(`SELECT * FROM purchase_orders WHERE id = ?`, [id]);
    return rows; // array
  },

  // UPDATE header only
// Replace existing updateHeader with:
updateHeader: async (id, data) => {
  const sql = `
    UPDATE purchase_orders SET
      po_no = ?, party_type = ?, vendor_id = ?, farmer_id = ?, date = ?, bill_time = ?,
      address = ?, mobile_no = ?, gst_no = ?, place_of_supply = ?, 
      terms_condition = ?, total_amount = ?, gst_amount = ?, final_amount = ?, status = ?
    WHERE id = ?
  `;
  const values = [
    data.po_no || "",
    data.party_type || "vendor",
    data.vendor_id ?? null,
    data.farmer_id ?? null,
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
    id,
  ];
  const [result] = await q(sql, values);
  return result;
},


  // DELETE header
  delete: async (id) => {
    const [result] = await q(`DELETE FROM purchase_orders WHERE id = ?`, [id]);
    return result;
  },

  // OPTIONAL: update a single item (kept for controller compatibility)
  updateItem: async (id, data) => {
    if (!data.product_id) throw new Error("product_id is required for updating purchase_order_items");

    const sql = `
      UPDATE purchase_order_items SET
        product_id = ?, hsn_code = ?, qty = ?, rate = ?, amount = ?,
        discount_per_qty = ?, discount_rate = ?, discount_total = ?,
        gst_percent = ?, gst_amount = ?, final_amount = ?, status = ?
      WHERE id = ?
    `;
    const values = [
      toNum(data.product_id),
      data.hsn_code || "",
      toNum(data.qty),
      toNum(data.rate),
      toNum(data.amount),
      toNum(data.discount_per_qty),
      toNum(data.discount_rate),
      toNum(data.discount_total),
      toNum(data.gst_percent),
      toNum(data.gst_amount),
      toNum(data.final_amount),
      data.status || "Active",
      id,
    ];
    const [result] = await q(sql, values);
    return result;
  },

  // Atomic create with items using transactions
  createWithItems: async (header, items) => {
    if (!Array.isArray(items) || items.length === 0) throw new Error("items required");
    const conn = await getConn();
    try {
      await begin(conn);

      const [hdr] = await exec(
        conn,
        `INSERT INTO purchase_orders
         (po_no, vendor_id, date, bill_time, address, mobile_no, gst_no, place_of_supply, terms_condition, total_amount, gst_amount, final_amount, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          header.po_no || "",
          toNum(header.vendor_id),
          header.date || null,
          header.bill_time || null,
          header.address || "",
          header.mobile_no || "",
          header.gst_no || "",
          header.place_of_supply || "",
          header.terms_condition || "",
          toNum(header.total_amount),
          toNum(header.gst_amount),
          toNum(header.final_amount),
          header.status || "Issued",
        ]
      );
      const poId = hdr.insertId;

      for (const it of items) {
        await exec(
          conn,
          `INSERT INTO purchase_order_items
           (purchase_order_id, product_id, hsn_code, qty, rate, amount, discount_per_qty, discount_rate, discount_total, gst_percent, gst_amount, final_amount, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            poId,
            toNum(it.product_id),
            it.hsn_code || "",
            toNum(it.qty),
            toNum(it.rate),
            toNum(it.amount),
            toNum(it.discount_per_qty),
            toNum(it.discount_rate),
            toNum(it.discount_total),
            toNum(it.gst_percent),
            toNum(it.gst_amount),
            toNum(it.final_amount),
            it.status || "Active",
          ]
        );
      }

      await commit(conn);
      release(conn);
      return { insertId: poId };
    } catch (e) {
      await rollback(conn);
      release(conn);
      throw e;
    }
  },

  updateHeaderAndUpsertItems: async (id, header, items) => {
    if (!Array.isArray(items) || items.length === 0) throw new Error("items required");
    const conn = await getConn();
    try {
      await begin(conn);

      await exec(
        conn,
        `UPDATE purchase_orders SET
           po_no = ?, vendor_id = ?, date = ?, bill_time = ?,
           address = ?, mobile_no = ?, gst_no = ?, place_of_supply = ?,
           terms_condition = ?, total_amount = ?, gst_amount = ?, final_amount = ?, status = ?
         WHERE id = ?`,
        [
          header.po_no || "",
          toNum(header.vendor_id),
          header.date || null,
          header.bill_time || null,
          header.address || "",
          header.mobile_no || "",
          header.gst_no || "",
          header.place_of_supply || "",
          header.terms_condition || "",
          toNum(header.total_amount),
          toNum(header.gst_amount),
          toNum(header.final_amount),
          header.status || "Issued",
          id,
        ]
      );

      for (const it of items) {
        if (it.id) {
          await exec(
            conn,
            `UPDATE purchase_order_items SET
               product_id = ?, hsn_code = ?, qty = ?, rate = ?, amount = ?,
               discount_per_qty = ?, discount_rate = ?, discount_total = ?,
               gst_percent = ?, gst_amount = ?, final_amount = ?, status = ?
             WHERE id = ? AND purchase_order_id = ?`,
            [
              toNum(it.product_id),
              it.hsn_code || "",
              toNum(it.qty),
              toNum(it.rate),
              toNum(it.amount),
              toNum(it.discount_per_qty),
              toNum(it.discount_rate),
              toNum(it.discount_total),
              toNum(it.gst_percent),
              toNum(it.gst_amount),
              toNum(it.final_amount),
              it.status || "Active",
              it.id,
              id,
            ]
          );
        } else {
          await exec(
            conn,
            `INSERT INTO purchase_order_items
             (purchase_order_id, product_id, hsn_code, qty, rate, amount, discount_per_qty, discount_rate, discount_total, gst_percent, gst_amount, final_amount, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              toNum(it.product_id),
              it.hsn_code || "",
              toNum(it.qty),
              toNum(it.rate),
              toNum(it.amount),
              toNum(it.discount_per_qty),
              toNum(it.discount_rate),
              toNum(it.discount_total),
              toNum(it.gst_percent),
              toNum(it.gst_amount),
              toNum(it.final_amount),
              it.status || "Active",
            ]
          );
        }
      }

      await commit(conn);
      release(conn);
      return { affectedRows: 1 };
    } catch (e) {
      await rollback(conn);
      release(conn);
      throw e;
    }
  },
};

module.exports = PurchaseOrder;
