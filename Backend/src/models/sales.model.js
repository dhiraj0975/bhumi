// models/sales.model.js
const mysql = require('mysql2/promise');

const { tn } = require('../services/tableName');
const { createCompanyTables } = require('../services/companyTables');

const Sales = {
  getConnection: async () => {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      port: process.env.DB_PORT,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: false,
    });
    return conn;
  },

  // Generate next bill number like BILL-001, BILL-002 ...
  getNewBillNo: async (code) => {
    // ensure per-company tables exist (idempotent)
    await createCompanyTables(code);
    const conn = await Sales.getConnection();
    try {
      const salesTable = tn(code, 'sales');
      const [rows] = await conn.execute(`SELECT bill_no FROM \`${salesTable}\` ORDER BY id DESC LIMIT 1`);
      let lastNo = 0;
      if (rows.length && rows[0].bill_no) {
        const parts = String(rows[0].bill_no).split('-');
        lastNo = parseInt(parts[1], 10) || 0;
      }
      return `BILL-${String(lastNo + 1).padStart(3, '0')}`;
    } finally {
      await conn.end();
    }
  },

  // Create sale (party-agnostic)
  create: async (payload, code) => {
    const {
      party_type,              // 'customer' | 'vendor' | 'farmer'
      customer_id = null,
      vendor_id = null,
      farmer_id = null,
      bill_no,
      bill_date,
      payment_status = 'Unpaid',
      payment_method = 'Cash',
      remarks = null,
      status = 'Active',
      items = [],
      cash_received = 0,
    } = payload;

    if (!bill_date) throw new Error('bill_date is required');
    if (!['customer', 'vendor', 'farmer'].includes(party_type)) {
      throw new Error('party_type must be customer|vendor|farmer');
    }
    const chosenId =
      party_type === 'customer' ? customer_id :
      party_type === 'vendor'   ? vendor_id   :
      party_type === 'farmer'   ? farmer_id   : null;
    if (!chosenId) throw new Error(`${party_type}_id is required`);
    if (!Array.isArray(items) || items.length === 0) throw new Error('items[] required');

    const conn = await Sales.getConnection();
    try {
      await conn.beginTransaction();

      // company table names
      const salesTable = tn(code, 'sales');
      const saleItemsTable = tn(code, 'sale_items');

      // Bill no (from company table)
      let finalBillNo = bill_no;
      if (!finalBillNo) {
        const [last] = await conn.execute(`SELECT bill_no FROM \`${salesTable}\` ORDER BY id DESC LIMIT 1`);
        let lastNo = 0;
        if (last.length && last[0].bill_no) {
          const parts = String(last[0].bill_no).split('-');
          lastNo = parseInt(parts[1], 10) || 0;
        }
        finalBillNo = `BILL-${String(lastNo + 1).padStart(3, '0')}`;
      }

      // Insert header (company specific table)
      const [saleRes] = await conn.execute(
        `INSERT INTO \`${salesTable}\`
         (customer_id, vendor_id, farmer_id, party_type, bill_no, bill_date, total_taxable, total_gst, total_amount, payment_status, payment_method, remarks, status)
         VALUES (?, ?, ?, ?, ?, ?, 0.00, 0.00, 0.00, ?, ?, ?, ?)`,
        [
          party_type === 'customer' ? chosenId : null,
          party_type === 'vendor'   ? chosenId : null,
          party_type === 'farmer'   ? chosenId : null,
          party_type,
          finalBillNo,
          bill_date,
          payment_status,
          payment_method,
          remarks,
          status,
        ]
      );
      const sale_id = saleRes.insertId;

      // Insert items and decrement stock
      let total_taxable = 0, total_gst = 0, total_amount = 0;
      for (const item of items) {
        if (!item.product_id || !item.qty) continue;

        const [prodRows] = await conn.execute(
          `SELECT 
             id,
             total AS rate,
             CAST(NULLIF(REPLACE(gst, '%', ''), '') AS DECIMAL(5,2)) AS gst_percent,
             size
           FROM products
           WHERE id=? FOR UPDATE`,
          [item.product_id]
        );
        if (!prodRows.length) throw new Error(`product ${item.product_id} not found`);

        const prod = prodRows[0];
        const currentSizeNum = Number(prod.size || 0);
        const qty = Number(item.qty || 0);
        if (!Number.isFinite(qty) || qty <= 0) throw new Error(`invalid qty for product ${item.product_id}`);
        if (qty > currentSizeNum) {
          throw new Error(`insufficient stock for product ${item.product_id}: available ${currentSizeNum}, requested ${qty}`);
        }

        const rate = Number(item.rate ?? prod.rate ?? 0);
        const discount_rate = Number(item.discount_rate ?? 0);
        const discount_amount = Number(item.discount_amount ?? (rate * qty * discount_rate) / 100);
        const taxable_amount = Number((rate * qty) - discount_amount);
        const gst_percent = Number(item.gst_percent ?? prod.gst_percent ?? 0);
        const gst_amount = Number((taxable_amount * gst_percent) / 100);
        const net_total = Number(taxable_amount + gst_amount);
        const unit = item.unit || 'PCS';

        // insert into per-company sale_items table
        await conn.execute(
          `INSERT INTO \`${saleItemsTable}\`
           (sale_id, product_id, rate, qty, discount_rate, discount_amount, taxable_amount, gst_percent, gst_amount, net_total, unit, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
          [sale_id, item.product_id, rate, qty, discount_rate, discount_amount, taxable_amount, gst_percent, gst_amount, net_total, unit]
        );

        const newSize = currentSizeNum - qty;
        await conn.execute(`UPDATE products SET size = ? WHERE id = ?`, [String(newSize), item.product_id]);

        total_taxable += taxable_amount;
        total_gst += gst_amount;
        total_amount += net_total;
      }

      // Update totals on sale
      await conn.execute(
        `UPDATE \`${tn(code,'sales')}\` SET total_taxable=?, total_gst=?, total_amount=? WHERE id=?`,
        [total_taxable.toFixed(2), total_gst.toFixed(2), total_amount.toFixed(2), sale_id]
      );

      // Previous due (party-aware): total_sales - total_payments (company-specific payments table)
      const paymentsTable = tn(code, 'sale_payments');
  // Ensure per-company payments table exists (idempotent)
  await conn.execute(`CREATE TABLE IF NOT EXISTS \`${paymentsTable}\` LIKE \`tpl_sale_payments\``);
      const [[agg]] = await conn.query(
        `
        SELECT
          COALESCE((
            SELECT SUM(s.total_amount)
            FROM \`${salesTable}\` s
            WHERE s.${party_type}_id = ? AND (s.status IS NULL OR s.status <> 'Cancelled')
          ), 0) AS total_sales,
          COALESCE((
            SELECT SUM(p.amount)
            FROM \`${paymentsTable}\` p
            WHERE p.party_type = ? AND p.${party_type}_id = ?
          ), 0) AS total_payments
        `,
        [chosenId, party_type, chosenId]
      );

      const total_sales = Number(agg?.total_sales || 0);
      const total_payments = Number(agg?.total_payments || 0);
      const previous_due = Math.max(total_sales - total_payments, 0);

      // gross_due = previous_due + current sale total
      const gross_due = previous_due + Number(total_amount || 0);

      // Payment insert (any party)
      const cash = Number(cash_received || 0);
      if (cash > 0) {
        await conn.execute(
          `INSERT INTO \`${paymentsTable}\` (sale_id, party_type, customer_id, vendor_id, farmer_id, payment_date, amount, method, remarks)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            sale_id,
            party_type,
            party_type === 'customer' ? chosenId : null,
            party_type === 'vendor'   ? chosenId : null,
            party_type === 'farmer'   ? chosenId : null,
            bill_date,
            cash.toFixed(2),
            payment_method || 'Cash',
            remarks || null,
          ]
        );
      }

      // New due and payment status
      const new_due = Math.max(gross_due - cash, 0);
      let final_payment_status = 'Unpaid';
      if (new_due <= 0 && (cash > 0 || gross_due === 0)) {
        final_payment_status = 'Paid';
      } else if (cash > 0 && new_due > 0) {
        final_payment_status = 'Partial';
      }

      // Persist payment_status (company table)
      await conn.execute(
        `UPDATE \`${salesTable}\` SET payment_status=? WHERE id=?`,
        [final_payment_status, sale_id]
      );

      await conn.commit();
      return {
        id: sale_id,
        bill_no: finalBillNo,
        total_taxable,
        total_gst,
        total_amount,
        previous_due,
        cash_received: cash,
        new_due,
        payment_status: final_payment_status,
      };
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      await conn.end();
    }
  },

  // List party-aware
  getAll: async (code) => {
    // ensure per-company tables exist (idempotent)
    await createCompanyTables(code);
    const conn = await Sales.getConnection();
    try {
      const salesTable = tn(code, 'sales');
      const [rows] = await conn.execute(
        `SELECT
           s.*,
           COALESCE(c.name, v.vendor_name, f.name)                                  AS party_name,
           COALESCE(c.address, v.address, NULL)                                     AS party_address,
           COALESCE(c.phone, v.contact_number, f.contact_number)                    AS party_phone,
           COALESCE(c.GST_No, v.gst_no, NULL)                                       AS party_gst,
           COALESCE(c.balance, v.balance, f.balance)                                AS party_balance,
           COALESCE(c.min_balance, v.min_balance, f.min_balance)                    AS party_min_balance
         FROM \`${salesTable}\` s
         LEFT JOIN customers c ON s.customer_id = c.id
         LEFT JOIN vendors   v ON s.vendor_id   = v.id
         LEFT JOIN farmers   f ON s.farmer_id   = f.id
         ORDER BY s.id DESC`
      );
      return rows;
    } finally {
      await conn.end();
    }
  },

  // Single sale with party fields
  getById: async (id, code) => {
    // ensure per-company tables exist (idempotent)
    await createCompanyTables(code);
    const conn = await Sales.getConnection();
    try {
      const salesTable = tn(code, 'sales');
      const saleItemsTable = tn(code, 'sale_items');
      const [saleRows] = await conn.execute(
        `SELECT
           s.*,
           COALESCE(c.name, v.vendor_name, f.name)                                  AS party_name,
           COALESCE(c.address, v.address, NULL)                                     AS party_address,
           COALESCE(c.phone, v.contact_number, f.contact_number)                    AS party_phone,
           COALESCE(c.GST_No, v.gst_no, NULL)                                       AS party_gst,
           COALESCE(c.balance, v.balance, f.balance)                                AS party_balance,
           COALESCE(c.min_balance, v.min_balance, f.min_balance)                    AS party_min_balance
         FROM \`${salesTable}\` s
         LEFT JOIN customers c ON s.customer_id = c.id
         LEFT JOIN vendors   v ON s.vendor_id   = v.id
         LEFT JOIN farmers   f ON s.farmer_id   = f.id
         WHERE s.id=?`,
        [id]
      );
      if (!saleRows.length) return null;

      const [items] = await conn.execute(
        `SELECT si.*, p.product_name AS item_name, p.hsn_code
         FROM \`${saleItemsTable}\` si
         JOIN products p ON si.product_id = p.id
         WHERE si.sale_id=?
         ORDER BY si.id ASC`,
        [id]
      );

      return { ...saleRows[0], items };
    } finally {
      await conn.end();
    }
  },

  // Update party-aware (optional payment on update)
  update: async (id, data, code) => {
    // ensure per-company tables exist (idempotent)
    await createCompanyTables(code);
    const conn = await Sales.getConnection();
    try {
      await conn.beginTransaction();

    // Load existing
  const salesTable = tn(code, 'sales');
  const saleItemsTable = tn(code, 'sale_items');
  const [existRows] = await conn.execute(`SELECT * FROM \`${salesTable}\` WHERE id=?`, [id]);
      if (!existRows.length) throw new Error('sale not found');
      const existing = existRows[0];

      const {
        party_type, customer_id = null, vendor_id = null, farmer_id = null,
        bill_no = null, bill_date = null, payment_status = 'Unpaid',
        payment_method = 'Cash', remarks = null, status = 'Active',
        items,
        cash_received = 0, // NEW
      } = data;

      if (!bill_date) throw new Error('bill_date is required');
      if (!['customer','vendor','farmer'].includes(party_type)) throw new Error('party_type must be customer|vendor|farmer');
      const chosenId =
        party_type === 'customer' ? customer_id :
        party_type === 'vendor'   ? vendor_id   :
        party_type === 'farmer'   ? farmer_id   : null;
      if (!chosenId) throw new Error(`${party_type}_id is required`);

      // Update header party FKs + basics (company table)
      await conn.execute(
        `UPDATE \`${salesTable}\`
           SET customer_id=?, vendor_id=?, farmer_id=?, party_type=?, bill_no=?, bill_date=?, payment_status=?, payment_method=?, remarks=?, status=?
         WHERE id=?`,
        [
          party_type === 'customer' ? chosenId : null,
          party_type === 'vendor'   ? chosenId : null,
          party_type === 'farmer'   ? chosenId : null,
          party_type,
          bill_no ?? existing.bill_no,
          bill_date ?? existing.bill_date,
          payment_status ?? existing.payment_status,
          payment_method ?? existing.payment_method,
          remarks ?? existing.remarks,
          status ?? existing.status,
          id
        ]
      );

      let total_taxable = Number(existing.total_taxable || 0);
      let total_gst = Number(existing.total_gst || 0);
      let total_amount = Number(existing.total_amount || 0);

      if (Array.isArray(items)) {
        // Restore stock from old items (company-specific table)
        const [oldItems] = await conn.execute(
          `SELECT product_id, qty, id FROM \`${saleItemsTable}\` WHERE sale_id=?`,
          [id]
        );
        for (const it of oldItems) {
          const [prodRows] = await conn.execute(
            `SELECT id, size FROM products WHERE id=? FOR UPDATE`,
            [it.product_id]
          );
          if (prodRows.length) {
            const currentSizeNum = Number(prodRows[0].size || 0);
            const newSize = currentSizeNum + Number(it.qty || 0);
            await conn.execute(`UPDATE products SET size=? WHERE id=?`, [String(newSize), it.product_id]);
          }
        }

  // Delete old items
  await conn.execute(`DELETE FROM \`${saleItemsTable}\` WHERE sale_id=?`, [id]);

        // Insert new items + decrement stock + recalc totals
        total_taxable = 0; total_gst = 0; total_amount = 0;
        for (const item of items) {
          if (!item.product_id || !item.qty) continue;

          const [prodRows] = await conn.execute(
            `SELECT 
               id,
               total AS rate,
               CAST(NULLIF(REPLACE(gst, '%', ''), '') AS DECIMAL(5,2)) AS gst_percent,
               size
             FROM products WHERE id=? FOR UPDATE`,
            [item.product_id]
          );
          if (!prodRows.length) throw new Error(`product ${item.product_id} not found`);

          const prod = prodRows[0];
          const currentSizeNum = Number(prod.size || 0);
          const qty = Number(item.qty || 0);
          if (qty > currentSizeNum) {
            throw new Error(`insufficient stock for product ${item.product_id}: available ${currentSizeNum}, requested ${qty}`);
          }

          const rate = Number(item.rate ?? prod.rate ?? 0);
          const discount_rate = Number(item.discount_rate ?? 0);
          const discount_amount = Number(item.discount_amount ?? (rate * qty * discount_rate) / 100);
          const taxable_amount = Number((rate * qty) - discount_amount);
          const gst_percent = Number(item.gst_percent ?? prod.gst_percent ?? 0);
          const gst_amount = Number((taxable_amount * gst_percent) / 100);
          const net_total = Number(taxable_amount + gst_amount);
          const unit = item.unit || 'PCS';

          await conn.execute(
            `INSERT INTO \`${saleItemsTable}\`
             (sale_id, product_id, rate, qty, discount_rate, discount_amount, taxable_amount, gst_percent, gst_amount, net_total, unit, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
          [id, item.product_id, rate, qty, discount_rate, discount_amount, taxable_amount, gst_percent, gst_amount, net_total, unit]
          );

          const newSize = currentSizeNum - qty;
          await conn.execute(`UPDATE products SET size=? WHERE id=?`, [String(newSize), item.product_id]);

          total_taxable += taxable_amount;
          total_gst += gst_amount;
          total_amount += net_total;
        }

        await conn.execute(
          `UPDATE \`${salesTable}\` SET total_taxable=?, total_gst=?, total_amount=? WHERE id=?`,
          [total_taxable.toFixed(2), total_gst.toFixed(2), total_amount.toFixed(2), id]
        );
      }

      // Optional payment on update
      const cash = Number(cash_received || 0);
      if (cash > 0) {
        const paymentsTable = tn(code, 'sale_payments');
        await conn.execute(`CREATE TABLE IF NOT EXISTS \`${paymentsTable}\` LIKE \`tpl_sale_payments\``);
        await conn.execute(
          `INSERT INTO \`${paymentsTable}\` (sale_id, party_type, customer_id, vendor_id, farmer_id, payment_date, amount, method, remarks)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            party_type,
            party_type === 'customer' ? chosenId : null,
            party_type === 'vendor'   ? chosenId : null,
            party_type === 'farmer'   ? chosenId : null,
            bill_date ?? existing.bill_date,
            cash.toFixed(2),
            payment_method || existing.payment_method || 'Cash',
            remarks ?? existing.remarks ?? null,
          ]
        );
      }

      // Recompute aggregates to derive final status (use company sales table)
      const paymentsTable = tn(code, 'sale_payments');
      const [[agg]] = await conn.query(
        `
        SELECT
          COALESCE((
            SELECT SUM(s.total_amount)
            FROM \`${salesTable}\` s
            WHERE s.${party_type}_id = ? AND (s.status IS NULL OR s.status <> 'Cancelled')
          ), 0) AS total_sales,
          COALESCE((
            SELECT SUM(p.amount)
            FROM \`${paymentsTable}\` p
            WHERE p.party_type = ? AND p.${party_type}_id = ?
          ), 0) AS total_payments
        `,
        [chosenId, party_type, chosenId]
      );

      const total_sales = Number(agg?.total_sales || 0);
      const total_payments = Number(agg?.total_payments || 0);
      const gross_due = Math.max(total_sales - total_payments, 0);

      let final_payment_status = 'Unpaid';
      if (gross_due <= 0 && (cash > 0 || total_amount === 0)) {
        final_payment_status = 'Paid';
      } else if (cash > 0 && gross_due > 0) {
        final_payment_status = 'Partial';
      } else {
        // keep provided or existing if no change
        final_payment_status = payment_status ?? existing.payment_status ?? 'Unpaid';
      }

      await conn.execute(
        `UPDATE \`${salesTable}\` SET payment_status=? WHERE id=?`,
        [final_payment_status, id]
      );

      await conn.commit();
      return { id, total_taxable, total_gst, total_amount };
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      await conn.end();
    }
  },

  // Delete sale (no stock restore by choice)
  delete: async (id, code) => {
    const conn = await Sales.getConnection();
    try {
      await conn.beginTransaction();
      const salesTable = tn(code, 'sales');
      const saleItemsTable = tn(code, 'sale_items');
      await conn.execute(`DELETE FROM \`${saleItemsTable}\` WHERE sale_id=?`, [id]);
      const [res] = await conn.execute(`DELETE FROM \`${salesTable}\` WHERE id=?`, [id]);
      await conn.commit();
      return res;
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      await conn.end();
    }
  },

  // Party-specific fetch (legacy helper) - company-aware
  getByCustomerId: async (customer_id, code = null) => {
    const conn = await Sales.getConnection();
    try {
      const salesTable = code ? tn(code, 'sales') : 'sales';
      const saleItemsTable = code ? tn(code, 'sale_items') : 'sale_items';
      const [rows] = await conn.execute(
        `SELECT s.*, c.name AS party_name
         FROM \`${salesTable}\` s
         LEFT JOIN customers c ON s.customer_id = c.id
         WHERE s.customer_id=?
         ORDER BY s.id DESC`,
        [customer_id]
      );

      for (const sale of rows) {
        const [items] = await conn.execute(
          `SELECT si.*, p.product_name AS item_name, p.hsn_code
           FROM \`${saleItemsTable}\` si
           JOIN products p ON si.product_id = p.id
           WHERE si.sale_id=?`,
          [sale.id]
        );
        sale.items = items;
      }
      return rows;
    } finally {
      await conn.end();
    }
  },
};

module.exports = Sales;
