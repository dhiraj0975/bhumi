
// // models/purchase.model.js
// const db = require("../config/db");

// const Purchase = {
//   // Create Purchase + Items + Update Stock (size += qty)
//   create: async (data) => {
//     const { vendor_id, gst_no, bill_no, bill_date, status, items } = data;

//     if (!Array.isArray(items) || items.length === 0) {
//       throw new Error("Items must be a non-empty array");
//     }

//     const conn = db.promise();
//     try {
//       await conn.beginTransaction();

//       const formattedDate = bill_date ? new Date(bill_date).toISOString().split("T")[0] : null;

//       const total_amount = items.reduce(
//         (sum, i) => sum + Number(i.rate || 0) * Number(i.size || 0),
//         0
//       );

//       // Insert purchase header
//       const [purchaseResult] = await conn.query(
//         `INSERT INTO purchases (vendor_id, gst_no, bill_no, bill_date, total_amount, status)
//          VALUES (?, ?, ?, ?, ?, ?)`,
//         [vendor_id, gst_no || null, bill_no, formattedDate, total_amount, status || "Active"]
//       );
//       const purchaseId = purchaseResult.insertId;

//       // Insert items
//       if (items.length > 0) {
//         const values = items.map((i) => [
//           purchaseId,
//           i.product_id,
//           Number(i.rate || 0),
//           Number(i.size || 0),
//           i.unit || "PCS",
//           "Active",
//         ]);

//         await conn.query(
//           `INSERT INTO purchase_items (purchase_id, product_id, rate, size, unit, status) VALUES ?`,
//           [values]
//         );

//         // Increment product stock (size)
//         for (const i of items) {
//           // Lock product row for safe update and read current size
//           const [prodRows] = await conn.query(
//             `SELECT id, size FROM products WHERE id = ? FOR UPDATE`,
//             [i.product_id]
//           );
//           if (!prodRows.length) throw new Error(`product ${i.product_id} not found`);

//           const curr = Number(prodRows[0].size || 0);
//           const inc = Number(i.size || 0);
//           if (!Number.isFinite(inc) || inc < 0) throw new Error(`invalid purchase size for product ${i.product_id}`);

//           const newSize = curr + inc;
//           await conn.query(`UPDATE products SET size = ? WHERE id = ?`, [String(newSize), i.product_id]);
//         }
//       }

//       await conn.commit();
//       return purchaseId;
//     } catch (err) {
//       await conn.rollback();
//       console.error("Purchase creation error:", err);
//       throw err;
//     }
//   },

//   // Find all with vendor and items
//   findAll: async () => {
//     const conn = db.promise();
//     try {
//       const [purchases] = await conn.query(`
//         SELECT 
//           p.id, 
//           p.bill_no, 
//           p.bill_date, 
//           p.total_amount, 
//           p.status,
//           v.vendor_name, 
//           v.firm_name
//         FROM purchases p
//         JOIN vendors v ON p.vendor_id = v.id
//         ORDER BY p.id DESC
//       `);

//       if (purchases.length === 0) return [];

//       const purchaseIds = purchases.map((p) => p.id);
//       const [items] = await conn.query(
//         `
//         SELECT pi.*, pr.product_name
//         FROM purchase_items pi
//         JOIN products pr ON pi.product_id = pr.id
//         WHERE pi.purchase_id IN (?)
//       `,
//         [purchaseIds]
//       );

//       const purchasesWithItems = purchases.map((p) => {
//         p.items = items.filter((i) => i.purchase_id === p.id);
//         return p;
//       });

//       return purchasesWithItems;
//     } catch (err) {
//       console.error("Error fetching purchases:", err);
//       throw err;
//     }
//   },

//   // Find one by id with items
//   findById: async (id) => {
//     const conn = db.promise();
//     const [purchaseRows] = await conn.query(
//       `SELECT p.*, v.name AS vendor_name, v.firm_name
//        FROM purchases p
//        JOIN vendors v ON p.vendor_id = v.id
//        WHERE p.id = ?`,
//       [id]
//     );
//     if (purchaseRows.length === 0) return null;

//     const purchase = purchaseRows[0];

//     const PurchaseItem = require("./purchaseItem.model2");
//     const items = await PurchaseItem.findByPurchaseId(id);
//     purchase.items = items;

//     return purchase;
//   },
// };

// module.exports = Purchase;



// models/purchase.model.js
const db = require("../config/db");

const Purchase = {
  create: async (data) => {
    const { party_type, vendor_id, farmer_id, gst_no, bill_no, bill_date, status, items } = data;
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Items must be a non-empty array");
    }

    const conn = db.promise();
    try {
      await conn.beginTransaction();

      const formattedDate = bill_date ? new Date(bill_date).toISOString().split("T")[0] : null;
      const total_amount = items.reduce((sum, i) => sum + Number(i.rate || 0) * Number(i.size || 0), 0);

      const [purchaseResult] = await conn.query(
        `INSERT INTO purchases (vendor_id, farmer_id, party_type, gst_no, bill_no, bill_date, total_amount, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          party_type === 'vendor' ? vendor_id : null,
          party_type === 'farmer' ? farmer_id : null,
          party_type,
          gst_no || null,
          bill_no,
          formattedDate,
          total_amount,
          status || "Active",
        ]
      );

      const purchaseId = purchaseResult.insertId;

      if (items.length > 0) {
        const values = items.map((i) => [
          purchaseId,
          Number(i.product_id),
          Number(i.rate || 0),
          Number(i.size || 0),
          i.unit || "PCS",
          "Active",
        ]);

        await conn.query(
          `INSERT INTO purchase_items (purchase_id, product_id, rate, size, unit, status) VALUES ?`,
          [values]
        );

        for (const i of items) {
          const [prodRows] = await conn.query(
            `SELECT id, size FROM products WHERE id = ? FOR UPDATE`,
            [i.product_id]
          );
          if (!prodRows.length) throw new Error(`product ${i.product_id} not found`);
          const curr = Number(prodRows[0].size || 0);
          const inc = Number(i.size || 0);
          const newSize = curr + inc;
          await conn.query(`UPDATE products SET size = ? WHERE id = ?`, [String(newSize), i.product_id]);
        }
      }

      await conn.commit();
      return purchaseId;
    } catch (err) {
      await conn.rollback();
      console.error("Purchase creation error:", err);
      throw err;
    }
  },

  findAll: async () => {
    const conn = db.promise();
    try {
      const [purchases] = await conn.query(`
        SELECT 
          p.id, p.bill_no, p.bill_date, p.total_amount, p.status, p.party_type,
          v.vendor_name, v.firm_name, f.name AS farmer_name
        FROM purchases p
        LEFT JOIN vendors v ON p.vendor_id = v.id
        LEFT JOIN farmers f ON p.farmer_id = f.id
        ORDER BY p.id DESC
      `);

      if (purchases.length === 0) return [];

      const purchaseIds = purchases.map((p) => p.id);
      const [items] = await conn.query(
        `
        SELECT pi.*, pr.product_name
        FROM purchase_items pi
        JOIN products pr ON pi.product_id = pr.id
        WHERE pi.purchase_id IN (?)
      `,
        [purchaseIds]
      );

      const purchasesWithItems = purchases.map((p) => {
        const party_name = p.party_type === 'vendor' ? p.vendor_name : p.farmer_name;
        return { ...p, party_name, items: items.filter((i) => i.purchase_id === p.id) };
      });

      return purchasesWithItems;
    } catch (err) {
      console.error("Error fetching purchases:", err);
      throw err;
    }
  },

  findById: async (id) => {
    const conn = db.promise();
    const [rows] = await conn.query(
      `
      SELECT p.*, v.vendor_name, v.firm_name, f.name AS farmer_name
      FROM purchases p
      LEFT JOIN vendors v ON p.vendor_id = v.id
      LEFT JOIN farmers f ON p.farmer_id = f.id
      WHERE p.id = ?
    `,
      [id]
    );

    if (rows.length === 0) return null;

    const purchase = rows[0];
    const PurchaseItem = require("./purchaseItem.model2");
    const items = await PurchaseItem.findByPurchaseId(id);
    purchase.party_name = purchase.party_type === 'vendor' ? purchase.vendor_name : purchase.farmer_name;
    purchase.items = items;

    return purchase;
  },
};

module.exports = Purchase;
