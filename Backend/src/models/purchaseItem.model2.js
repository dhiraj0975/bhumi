const db = require("../config/db");

const PurchaseItem = {
  // ✅ Create multiple purchase items (used by Purchase model)
  createBulk: async (purchaseId, items) => {
    if (!Array.isArray(items) || items.length === 0) return;

    try {
      const values = items.map((i) => [
        purchaseId,
        i.product_id,
        i.rate,
        i.size,
        i.unit || "PCS",
        "Active",
      ]);

      const query = `
        INSERT INTO purchase_items (purchase_id, product_id, rate, size, unit, status)
        VALUES ?
      `;

      const [result] = await db.promise().query(query, [values]);
      return result.insertId;
    } catch (err) {
      console.error("Error inserting purchase items:", err);
      throw err;
    }
  },

  // ✅ Get all items by purchase ID
  findByPurchaseId: async (purchaseId) => {
    try {
      const query = `
        SELECT pi.*, pr.product_name
        FROM purchase_items pi
        JOIN products pr ON pi.product_id = pr.id
        WHERE pi.purchase_id = ?
      `;
      const [rows] = await db.promise().query(query, [purchaseId]);
      return rows;
    } catch (err) {
      console.error("Error fetching purchase items:", err);
      throw err;
    }
  },

  // ✅ Delete items by purchase ID (used in update)
  deleteByPurchaseId: async (purchaseId) => {
    try {
      const query = `DELETE FROM purchase_items WHERE purchase_id = ?`;
      await db.promise().query(query, [purchaseId]);
    } catch (err) {
      console.error("Error deleting purchase items:", err);
      throw err;
    }
  },
};

module.exports = PurchaseItem;
