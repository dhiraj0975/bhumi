// // models/saleItems.model.js
// const db = require('../config/db');
// const mysql = require('mysql2/promise');

// const SaleItems = {
//   getConnection: async () => {
//     const conn = await mysql.createConnection({
//       host: process.env.DB_HOST,
//       user: process.env.DB_USER,
//       port: process.env.DB_PORT,
//       password: process.env.DB_PASSWORD,
//       database: process.env.DB_NAME,
//     });
//     return conn;
//   },

//   createBulk: async (sale_id, items = []) => {
//     if (!sale_id || !Array.isArray(items) || !items.length) {
//       return { total_taxable: 0, total_gst: 0, total_amount: 0 };
//     }
//     const conn = await SaleItems.getConnection();
//     try {
//       await conn.beginTransaction();

//       let total_taxable = 0, total_gst = 0, total_amount = 0;

//       for (const item of items) {
//         if (!item.product_id || !item.qty) continue;

//         const [prodRows] = await conn.execute(
//           `SELECT 
//              total AS rate,
//              CAST(NULLIF(REPLACE(gst, '%', ''), '') AS DECIMAL(5,2)) AS gst_percent
//            FROM products WHERE id=?`,
//           [item.product_id]
//         );
//         if (!prodRows.length) continue;

//         const rate = Number(item.rate ?? prodRows[0].rate ?? 0);
//         const qty = Number(item.qty ?? 0);
//         const discount_rate = Number(item.discount_rate ?? 0);
//         const discount_amount = Number(item.discount_amount ?? (rate * qty * discount_rate) / 100);
//         const taxable_amount = Number((rate * qty) - discount_amount);
//         const gst_percent = Number(item.gst_percent ?? prodRows[0].gst_percent ?? 0);
//         const gst_amount = Number((taxable_amount * gst_percent) / 100);
//         const net_total = Number(taxable_amount + gst_amount);
//         const unit = item.unit || 'PCS';

//         await conn.execute(
//           `INSERT INTO sale_items
//            (sale_id, product_id, rate, qty, discount_rate, discount_amount, taxable_amount, gst_percent, gst_amount, net_total, unit, status)
//            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
//           [
//             sale_id,
//             item.product_id,
//             rate,
//             qty,
//             discount_rate,
//             discount_amount,
//             taxable_amount,
//             gst_percent,
//             gst_amount,
//             net_total,
//             unit,
//           ]
//         );

//         total_taxable += taxable_amount;
//         total_gst += gst_amount;
//         total_amount += net_total;
//       }

//       await conn.commit();
//       return {
//         total_taxable: Number(total_taxable.toFixed(2)),
//         total_gst: Number(total_gst.toFixed(2)),
//         total_amount: Number(total_amount.toFixed(2)),
//       };
//     } catch (e) {
//       await conn.rollback();
//       throw e;
//     } finally {
//       await conn.end();
//     }
//   },

//   getBySaleId: async (sale_id) => {
//     const conn = await SaleItems.getConnection();
//     try {
//       const [rows] = await conn.execute(
//         `SELECT si.*, p.product_name AS item_name, p.hsn_code
//          FROM sale_items si
//          JOIN products p ON si.product_id = p.id
//          WHERE si.sale_id=?
//          ORDER BY si.id ASC`,
//         [sale_id]
//       );
//       return rows;
//     } finally {
//       await conn.end();
//     }
//   },

//   deleteBySaleId: async (sale_id) => {
//     const conn = await SaleItems.getConnection();
//     try {
//       const [res] = await conn.execute('DELETE FROM sale_items WHERE sale_id=?', [sale_id]);
//       return res.affectedRows;
//     } finally {
//       await conn.end();
//     }
//   },
// };

// module.exports = SaleItems;




// models/saleItems.model.js
const mysql = require('mysql2/promise');

const SaleItems = {
  getConnection: async () => {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      port: process.env.DB_PORT,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    return conn;
  },

  createBulk: async (sale_id, items = []) => {
    if (!sale_id || !Array.isArray(items) || !items.length) {
      return { total_taxable: 0, total_gst: 0, total_amount: 0 };
    }
    const conn = await SaleItems.getConnection();
    try {
      await conn.beginTransaction();

      let total_taxable = 0, total_gst = 0, total_amount = 0;

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
          `INSERT INTO sale_items
           (sale_id, product_id, rate, qty, discount_rate, discount_amount, taxable_amount, gst_percent, gst_amount, net_total, unit, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
          [sale_id, item.product_id, rate, qty, discount_rate, discount_amount, taxable_amount, gst_percent, gst_amount, net_total, unit]
        );

        // decrement size
        const newSize = currentSizeNum - qty;
        await conn.execute(`UPDATE products SET size=? WHERE id=?`, [String(newSize), item.product_id]);

        total_taxable += taxable_amount;
        total_gst += gst_amount;
        total_amount += net_total;
      }

      await conn.commit();
      return {
        total_taxable: Number(total_taxable.toFixed(2)),
        total_gst: Number(total_gst.toFixed(2)),
        total_amount: Number(total_amount.toFixed(2)),
      };
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      await conn.end();
    }
  },

  getBySaleId: async (sale_id) => {
    const conn = await SaleItems.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT si.*, p.product_name AS item_name, p.hsn_code
         FROM sale_items si
         JOIN products p ON si.product_id = p.id
         WHERE si.sale_id=?
         ORDER BY si.id ASC`,
        [sale_id]
      );
      return rows;
    } finally {
      await conn.end();
    }
  },

  deleteBySaleId: async (sale_id) => {
    const conn = await SaleItems.getConnection();
    try {
      const [res] = await conn.execute('DELETE FROM sale_items WHERE sale_id=?', [sale_id]);
      return res.affectedRows;
    } finally {
      await conn.end();
    }
  },
};

module.exports = SaleItems;
