const db = require('../config/db');

const num = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const Customer = {
  // List all (explicit columns to avoid surprises)
  getAll: (callback) => {
    const sql = `
      SELECT
        id, name, email, phone, address, GST_No AS gst_no,
        balance, min_balance, status,
        DATE_FORMAT(created_at, '%Y-%m-%d %h:%i:%s %p') AS created_at_formatted,
        DATE_FORMAT(updated_at, '%Y-%m-%d %h:%i:%s %p') AS updated_at_formatted,
        created_at, updated_at
      FROM customers
      ORDER BY id DESC
    `;
    db.query(sql, (err, results) => callback(err, results));
  },

  getById: (id, callback) => {
    const sql = `
      SELECT
        id, name, email, phone, address, GST_No AS gst_no,
        balance, min_balance, status,
        DATE_FORMAT(created_at, '%Y-%m-%d %h:%i:%s %p') AS created_at_formatted,
        DATE_FORMAT(updated_at, '%Y-%m-%d %h:%i:%s %p') AS updated_at_formatted,
        created_at, updated_at
      FROM customers
      WHERE id = ?
    `;
    db.query(sql, [id], (err, results) => callback(err, results && results[0]));
  },

  create: (data, callback) => {
    const {
      name, email, phone, address, status,
      gst_no = null, balance = 0, min_balance = 5000,
    } = data;

    const sql = `
      INSERT INTO customers
        (name, email, phone, address, GST_No, balance, min_balance, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const params = [
      name,
      email || "",
      phone || "",
      address || "",
      gst_no || null,
      num(balance, 0),
      num(min_balance, 5000),
      status || "Active",
    ];

    db.query(sql, params, (err, result) => {
      if (err) return callback(err);
      callback(null, {
        id: result.insertId,
        name,
        email: email || "",
        phone: phone || "",
        address: address || "",
        gst_no: gst_no || null,
        balance: Number(num(balance, 0)).toFixed(2),
        min_balance: Number(num(min_balance, 5000)).toFixed(2),
        status: status || "Active",
      });
    });
  },

  update: (id, data, callback) => {
    // Allowed fields: removed add_gst, gst_percent; added gst_no
    const allowed = [
      "name","email","phone","address","status","gst_no","balance","min_balance",
    ];
    const fields = [];
    const params = [];

    allowed.forEach((k) => {
      if (data[k] !== undefined) {
        if (k === "balance" || k === "min_balance") {
          fields.push(`${k === 'gst_no' ? 'GST_No' : k}=?`);
          params.push(num(data[k], k === "min_balance" ? 5000 : 0));
        } else if (k === "gst_no") {
          fields.push(`GST_No=?`);
          params.push(data[k] || null);
        } else {
          fields.push(`${k}=?`);
          params.push(data[k]);
        }
      }
    });

    fields.push(`updated_at=NOW()`);

    const sql = `UPDATE customers SET ${fields.join(", ")} WHERE id=?`;
    params.push(id);

    db.query(sql, params, (err, result) => {
      if (err) return callback(err);
      callback(null, result.affectedRows);
    });
  },

  delete: (id, callback) => {
    const sql = "DELETE FROM customers WHERE id=?";
    db.query(sql, [id], (err, result) => {
      if (err) return callback(err);
      callback(null, result.affectedRows);
    });
  },

  toggleStatus: (id, currentStatus, callback) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    const sql = "UPDATE customers SET status=?, updated_at=NOW() WHERE id=?";
    db.query(sql, [newStatus, id], (err, result) => {
      if (err) return callback(err);
      callback(null, newStatus);
    });
  },

  findByEmail: (email, callback) => {
    const sql = `
      SELECT id, name, email, phone, address, GST_No AS gst_no,
             balance, min_balance, status, created_at, updated_at
      FROM customers WHERE email = ?
    `;
    db.query(sql, [email], (err, result) => {
      if (err) return callback(err, null);
      callback(null, result.length ? result[0] : null);
    });
  },

  // Aggregate previous due/advance computed on read (unchanged)
  getBalanceAggregate: (customerId, callback) => {
    const sql = `
      SELECT
        COALESCE((
          SELECT SUM(s.total_amount)
          FROM sales s
          WHERE s.customer_id = ? AND (s.status IS NULL OR s.status <> 'Cancelled')
        ), 0) AS total_sales,
        COALESCE((
          SELECT SUM(p.amount)
          FROM sale_payments p
          WHERE p.customer_id = ?
        ), 0) AS total_payments
    `;
    db.query(sql, [customerId, customerId], (err, rows) => {
      if (err) return callback(err);
      const row = rows?.[0] || {};
      const total_sales = Number(row.total_sales || 0);
      const total_payments = Number(row.total_payments || 0);
      const previous_due = Math.max(total_sales - total_payments, 0);
      const advance = Math.max(total_payments - total_sales, 0);
      callback(null, { previous_due, advance });
    });
  },

  // Statement + Summary remain same (no customer columns used here)
  getStatementQuery: (params, callback) => {
    const { customerId, from, to, limit, offset, sort } = params;

    const sql = `
      WITH inv_before AS (
        SELECT COALESCE(SUM(s.total_amount),0) AS amt
        FROM sales s
        WHERE s.customer_id=? AND s.status='Active' AND s.bill_date < ?
      ),
      pay_before AS (
        SELECT COALESCE(SUM(sp.amount),0) AS amt
        FROM sale_payments sp
        WHERE sp.customer_id=? AND sp.payment_date < ?
      ),
      opening AS (
        SELECT (i.amt - p.amt) AS opening_balance
        FROM inv_before i CROSS JOIN pay_before p
      ),
      u AS (
        SELECT
          s.customer_id,
          s.id AS ref_id,
          s.bill_no AS ref_no,
          COALESCE(s.created_at, TIMESTAMP(s.bill_date,'00:00:00')) AS tx_ts,
          'INVOICE' AS tx_type,
          s.total_amount AS debit_amount,
          0.00 AS credit_amount,
          s.remarks AS note,
          NULL AS payment_method
        FROM sales s
        WHERE s.customer_id=? AND s.status='Active' AND s.bill_date BETWEEN ? AND ?
        UNION ALL
        SELECT
          sp.customer_id,
          sp.id AS ref_id,
          CONCAT('PMT#', sp.id) AS ref_no,
          COALESCE(sp.created_at, TIMESTAMP(sp.payment_date,'00:00:00')) AS tx_ts,
          'RECEIPT' AS tx_type,
          0.00 AS debit_amount,
          sp.amount AS credit_amount,
          sp.remarks AS note,
          sp.method AS payment_method
        FROM sale_payments sp
        WHERE sp.customer_id=? AND sp.payment_date BETWEEN ? AND ?
      ),
      with_open AS (
        SELECT
          ? AS customer_id, 0 AS ref_id, 'OPENING' AS ref_no,
          TIMESTAMP(DATE_SUB(?, INTERVAL 1 DAY),'00:00:00') AS tx_ts,
          'OPENING' AS tx_type,
          0.00 AS debit_amount, 0.00 AS credit_amount,
          NULL AS note, NULL AS payment_method,
          (SELECT opening_balance FROM opening) AS net_effect,
          0 AS ord
        UNION ALL
        SELECT
          u.customer_id, u.ref_id, u.ref_no, u.tx_ts, u.tx_type,
          u.debit_amount, u.credit_amount, u.note, u.payment_method,
          (u.debit_amount - u.credit_amount) AS net_effect,
          CASE WHEN u.tx_type='INVOICE' THEN 1 ELSE 2 END AS ord
        FROM u u
      )
      SELECT
        c.name AS customer_name,
        DATE_FORMAT(w.tx_ts, '%Y-%m-%d %h:%i %p') AS tx_datetime,
        w.tx_type,
        w.ref_no,
        ROUND(CASE WHEN w.tx_type='RECEIPT' THEN w.credit_amount ELSE w.debit_amount END,2) AS amount,
        ROUND(w.net_effect,2) AS net_effect,
        ROUND(
          SUM(w.net_effect) OVER (
            PARTITION BY w.customer_id
            ORDER BY w.tx_ts, w.ord, w.ref_id
            ROWS UNBOUNDED PRECEDING
          ),2
        ) AS running_balance,
        w.payment_method,
        w.note
      FROM with_open w
      JOIN customers c ON c.id = w.customer_id
      ORDER BY w.tx_ts ${sort}, w.ord ${sort}, w.ref_id ${sort}
      LIMIT ? OFFSET ?;
    `;

    const paramsArr = [
      customerId, from,
      customerId, from,
      customerId, from, to,
      customerId, from, to,
      customerId, from,
      limit, offset
    ];

    db.query(sql, paramsArr, (err, rows) => {
      if (err) return callback(err);

      const totalsSql = `
        SELECT
          (SELECT COALESCE(SUM(total_amount),0) FROM sales
           WHERE customer_id=? AND status='Active' AND bill_date BETWEEN ? AND ?) AS total_invoiced,
          (SELECT COALESCE(SUM(amount),0) FROM sale_payments
           WHERE customer_id=? AND payment_date BETWEEN ? AND ?) AS total_paid,
          (SELECT COALESCE(SUM(total_amount),0) FROM sales
           WHERE customer_id=? AND status='Active' AND bill_date <= ?)
           -
          (SELECT COALESCE(SUM(amount),0) FROM sale_payments
           WHERE customer_id=? AND payment_date <= ?) AS outstanding_as_of_to,
          (SELECT COUNT(*) FROM sale_payments
           WHERE customer_id=? AND payment_date BETWEEN ? AND ?) AS payment_count,
          (SELECT opening_balance FROM (
              WITH inv_before AS (
                SELECT COALESCE(SUM(s.total_amount),0) AS amt
                FROM sales s
                WHERE s.customer_id=? AND s.status='Active' AND s.bill_date < ?
              ),
              pay_before AS (
                SELECT COALESCE(SUM(sp.amount),0) AS amt
                FROM sale_payments sp
                WHERE sp.customer_id=? AND sp.payment_date < ?
              )
              SELECT (inv_before.amt - pay_before.amt) AS opening_balance
              FROM inv_before CROSS JOIN pay_before
           ) t) AS opening_balance
      `;

      const totalsParams = [
        customerId, from, to,
        customerId, from, to,
        customerId, to,
        customerId, to,
        customerId, from, to,
        customerId, from,
        customerId, from
      ];

      db.query(totalsSql, totalsParams, (err2, kpiRows) => {
        if (err2) return callback(err2);
        callback(null, { rows, totals: kpiRows?.[0] || {} });
      });
    });
  },

  getSummaryQuery: ({ customerId, as_of }, callback) => {
    const sql = `
      SELECT
        (SELECT COALESCE(SUM(total_amount),0) FROM sales
         WHERE customer_id=? AND status='Active' AND bill_date <= ?) AS total_invoiced_upto,
        (SELECT COALESCE(SUM(amount),0) FROM sale_payments
         WHERE customer_id=? AND payment_date <= ?) AS total_paid_upto,
        ((SELECT COALESCE(SUM(total_amount),0) FROM sales
          WHERE customer_id=? AND status='Active' AND bill_date <= ?)
         -
         (SELECT COALESCE(SUM(amount),0) FROM sale_payments
          WHERE customer_id=? AND payment_date <= ?)) AS outstanding_as_of,
        (SELECT COUNT(*) FROM sale_payments
         WHERE customer_id=? AND payment_date <= ?) AS payment_count_upto
    `;
    const p = [
      customerId, as_of,
      customerId, as_of,
      customerId, as_of,
      customerId, as_of,
      customerId, as_of
    ];
    db.query(sql, p, (err, rows) => {
      if (err) return callback(err);
      callback(null, rows?.[0] || {});
    });
  },
};

module.exports = Customer;
