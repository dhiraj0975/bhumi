  const PurchaseOrder = require("../models/purchaseOrder.model");
  const PurchaseOrderItem = require("../models/purchaseOrderItem.model");
  const db = require("../config/db");

  // Numeric helper
  const toNum = (v, d = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  };

  // Per-item calc (percent-per-qty)
  const calculateItem = (item) => {
    const qty = toNum(item.qty);
    const rate = toNum(item.rate);
    const amount = qty * rate;

    const discountRatePerUnit = (rate * toNum(item.discount_per_qty)) / 100;
    const discount_total = discountRatePerUnit * qty;

    const taxable = amount - discount_total;
    const gst_amount = (taxable * toNum(item.gst_percent)) / 100;
    const final_amount = taxable + gst_amount;

    return {
      amount: Number(amount.toFixed(2)),
      discount_rate: Number(discountRatePerUnit.toFixed(2)),
      discount_total: Number(discount_total.toFixed(2)),
      gst_amount: Number(gst_amount.toFixed(2)),
      final_amount: Number(final_amount.toFixed(2)),
    };
  };

  const purchaseOrderController = {
    // Create PO with items
    async create(req, res) {
      const conn = db.promise();
      try {
        const {
          po_no,
          party_type = "vendor",
          vendor_id,
          farmer_id,
          date,
          bill_time,
          address,
          mobile_no,
          gst_no,
          place_of_supply,
          terms_condition,
          items = [],
          status,
        } = req.body;

        // Validate
        if (!Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ error: "items are required" });
        }
        if (party_type === "vendor" && !vendor_id) {
          return res.status(400).json({ error: "vendor_id is required for vendor party_type" });
        }
        if (party_type === "farmer" && !farmer_id) {
          return res.status(400).json({ error: "farmer_id is required for farmer party_type" });
        }

        // Totals
        let totalAmount = 0, totalGST = 0, finalAmount = 0;
        const computedItems = items.map((it) => {
          const calc = calculateItem(it);
          totalAmount += calc.amount - calc.discount_total;
          totalGST += calc.gst_amount;
          finalAmount += calc.final_amount;
          return { raw: it, calc };
        });

        // Header
// Normalize ids so that 0 never goes to DB
const isVendor = party_type === 'vendor';
const normalizedVendorId = isVendor ? (vendor_id ? Number(vendor_id) : null) : null;
const normalizedFarmerId = !isVendor ? (farmer_id ? Number(farmer_id) : null) : null;

// Header
const poData = {
  po_no,
  party_type,
  vendor_id: normalizedVendorId,
  farmer_id: normalizedFarmerId,
  date,
  bill_time,
  address,
  mobile_no,
  gst_no,
  place_of_supply,
  terms_condition,
  total_amount: Number(totalAmount.toFixed(2)),
  gst_amount: Number(totalGST.toFixed(2)),
  final_amount: Number(finalAmount.toFixed(2)),
  status: status || "Issued",
};


        const headerResult = await PurchaseOrder.create(poData);
        const purchase_order_id = headerResult.insertId;

        // Items
        const createdItems = [];
        for (const { raw } of computedItems) {
          const itemData = {
            purchase_order_id,
            product_id: Number(raw.product_id),
            hsn_code: raw.hsn_code || "",
            qty: Number(raw.qty || 0),
            rate: Number(raw.rate || 0),
            discount_per_qty: Number(raw.discount_per_qty || 0),
            gst_percent: Number(raw.gst_percent || 0),
            status: raw.status || "Active",
          };
          const itemResult = await PurchaseOrderItem.create(itemData);
          createdItems.push({ id: itemResult.insertId, ...itemData });
        }

        // Optional: party_name join
        let party_name = null;
        if (poData.party_type === "vendor" && poData.vendor_id) {
          const [rows] = await conn.query("SELECT vendor_name AS name FROM vendors WHERE id=?", [poData.vendor_id]);
          party_name = rows?.[0]?.name || null;
        } else if (poData.party_type === "farmer" && poData.farmer_id) {
          const [rows] = await conn.query("SELECT name FROM farmers WHERE id=?", [poData.farmer_id]);
          party_name = rows?.[0]?.name || null;
        }

        return res.status(201).json({
          message: "Purchase Order created successfully",
          purchase_order: {
            id: purchase_order_id,
            ...poData,
            party_name,
            items: createdItems,
            summary: {
              total_taxable: Number(totalAmount.toFixed(2)),
              total_gst: Number(totalGST.toFixed(2)),
              grand_total: Number(finalAmount.toFixed(2)),
            },
          },
        });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
      }
    },

    // Get all POs (grouped)
    async getAll(_req, res) {
      try {
        const poRows = await PurchaseOrder.getAllRaw();
        const poMap = {};
        for (const row of poRows) {
          const poId = row.purchase_order_id;
          if (!poMap[poId]) {
            poMap[poId] = {
              id: poId,
              po_no: row.po_no,
              party_type: row.party_type,
              vendor_id: row.vendor_id,
              farmer_id: row.farmer_id,
              vendor_name: row.vendor_name,
              farmer_name: row.farmer_name,
              date: row.date,
              bill_time: row.bill_time,
              address: row.address,
              mobile_no: row.mobile_no,
              gst_no: row.gst_no,
              place_of_supply: row.place_of_supply,
              terms_condition: row.terms_condition,
              status: row.status,
              items: [],
              summary: { total_taxable: 0, total_gst: 0, grand_total: 0 },
            };
          }
          poMap[poId].items.push({
            id: row.item_id,
            product_id: row.product_id,
            product_name: row.product_name,
            hsn_code: row.hsn_code,
            qty: Number(row.qty),
            rate: Number(row.rate),
            amount: Number(row.amount),
            discount_per_qty: Number(row.discount_per_qty),
            discount_rate: Number(row.discount_rate),
            discount_total: Number(row.discount_total),
            gst_percent: Number(row.gst_percent),
            gst_amount: Number(row.item_gst),
            final_amount: Number(row.item_final),
          });
          poMap[poId].summary.total_taxable += Number(row.amount) - Number(row.discount_total);
          poMap[poId].summary.total_gst += Number(row.item_gst);
          poMap[poId].summary.grand_total += Number(row.item_final);
        }

        const pos = Object.values(poMap).map((po) => ({
          ...po,
          summary: {
            total_taxable: Number(po.summary.total_taxable.toFixed(2)),
            total_gst: Number(po.summary.total_gst.toFixed(2)),
            grand_total: Number(po.summary.grand_total.toFixed(2)),
          },
        }));

        return res.json(pos);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
      }
    },

    // Get single PO
    async getById(req, res) {
      try {
        const { id } = req.params;
        const poRows = await PurchaseOrder.getById(id);
        if (poRows.length === 0) return res.status(404).json({ message: "PO not found" });

        const itemRows = await PurchaseOrderItem.getByPOId(id);
        const summary = itemRows.reduce(
          (acc, item) => {
            acc.total_taxable += Number(item.amount) - Number(item.discount_total);
            acc.total_gst += Number(item.gst_amount);
            acc.grand_total += Number(item.final_amount);
            return acc;
          },
          { total_taxable: 0, total_gst: 0, grand_total: 0 }
        );

        return res.json({
          ...poRows[0],
          items: itemRows,
          summary: {
            total_taxable: Number(summary.total_taxable.toFixed(2)),
            total_gst: Number(summary.total_gst.toFixed(2)),
            grand_total: Number(summary.grand_total.toFixed(2)),
          },
        });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
      }
    },

    // Delete PO (+ items)
    async delete(req, res) {
      try {
        const { id } = req.params;
        await PurchaseOrderItem.deleteByPOId(id);
        await PurchaseOrder.delete(id);
        return res.json({ message: "Purchase Order deleted successfully" });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
      }
    },

    // Invoice payload
    async getInvoice(req, res) {
      try {
        const { id } = req.params;
        const poRows = await PurchaseOrder.getById(id);
        if (poRows.length === 0) return res.status(404).json({ message: "PO not found" });

        const po = poRows[0];
        const items = await PurchaseOrderItem.getByPOId(id);
        const summary = items.reduce(
          (acc, item) => {
            acc.total_taxable += Number(item.amount) - Number(item.discount_total);
            acc.total_gst += Number(item.gst_amount);
            acc.grand_total += Number(item.final_amount);
            return acc;
          },
          { total_taxable: 0, total_gst: 0, grand_total: 0 }
        );

        // Optional: party name enrich for invoice
        let party_name = null;
        if (po.party_type === "vendor" && po.vendor_id) {
          party_name = po.vendor_name || null;
        } else if (po.party_type === "farmer" && po.farmer_id) {
          party_name = po.farmer_name || null;
        }

        return res.json({
          invoiceNo: `INV-${po.id}`,
          date: po.date,
          party_type: po.party_type,
          vendor_id: po.vendor_id,
          farmer_id: po.farmer_id,
          party_name,
          vendor: {
            name: party_name || undefined,
            address: po.address,
            gst_no: po.gst_no,
          },
          items,
          summary: {
            total_taxable: Number(summary.total_taxable.toFixed(2)),
            total_gst: Number(summary.total_gst.toFixed(2)),
            grand_total: Number(summary.grand_total.toFixed(2)),
          },
        });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
      }
    },

    // Update PO (upsert items)
    async update(req, res) {
      try {
        const { id } = req.params;
        const {
          po_no,
          party_type = "vendor",
          vendor_id,
          farmer_id,
          date,
          bill_time,
          address,
          mobile_no,
          gst_no,
          place_of_supply,
          terms_condition,
          status,
          items = [],
        } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ error: "items are required" });
        }
        if (party_type === "vendor" && !vendor_id) {
          return res.status(400).json({ error: "vendor_id is required for vendor party_type" });
        }
        if (party_type === "farmer" && !farmer_id) {
          return res.status(400).json({ error: "farmer_id is required for farmer party_type" });
        }

        let totalAmount = 0, totalGST = 0, finalAmount = 0;
        const computed = items.map((it) => {
          const calc = calculateItem(it);
          totalAmount += calc.amount - calc.discount_total;
          totalGST += calc.gst_amount;
          finalAmount += calc.final_amount;
          return { raw: it, calc };
        });

const isVendor = party_type === 'vendor';
const normalizedVendorId = isVendor ? (vendor_id ? Number(vendor_id) : null) : null;
const normalizedFarmerId = !isVendor ? (farmer_id ? Number(farmer_id) : null) : null;

await PurchaseOrder.updateHeader(id, {
  po_no,
  party_type,
  vendor_id: normalizedVendorId,
  farmer_id: normalizedFarmerId,
  date,
  bill_time,
  address,
  mobile_no,
  gst_no,
  place_of_supply,
  terms_condition,
  total_amount: Number(totalAmount.toFixed(2)),
  gst_amount: Number(totalGST.toFixed(2)),
  final_amount: Number(finalAmount.toFixed(2)),
  status: status || "Issued",
});


        for (const { raw } of computed) {
          const itemData = {
            product_id: Number(raw.product_id),
            hsn_code: raw.hsn_code || "",
            qty: Number(raw.qty || 0),
            rate: Number(raw.rate || 0),
            discount_per_qty: Number(raw.discount_per_qty || 0),
            gst_percent: Number(raw.gst_percent || 0),
            status: raw.status || "Active",
          };
          if (raw.id) {
            await PurchaseOrderItem.update(raw.id, itemData);
          } else {
            await PurchaseOrderItem.create({ purchase_order_id: id, ...itemData });
          }
        }

        return res.json({ message: "Purchase Order updated successfully" });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
      }
    },

    // PO -> Purchase prefill
    async getForPurchase(req, res) {
      const conn = db.promise();
      try {
        const { id } = req.params;

        const [poRows] = await conn.query(
          `SELECT 
            po.id, po.party_type, po.vendor_id, po.farmer_id,
            po.address, po.mobile_no, po.gst_no, po.terms_condition, po.status
          FROM purchase_orders po
          WHERE po.id = ?`,
          [id]
        );
        if (!poRows.length) return res.status(404).json({ error: "PO not found" });

        const po = poRows[0];
        if (po.status === "Cancelled") {
          return res.status(400).json({ error: "PO is cancelled" });
        }

        let party = { name: "", balance: 0, min_balance: 0 };
        if (po.party_type === "vendor" && po.vendor_id) {
          const [vrows] = await conn.query(
            `SELECT vendor_name AS name, COALESCE(balance,0) AS balance, COALESCE(min_balance,0) AS min_balance
            FROM vendors WHERE id=?`,
            [po.vendor_id]
          );
          if (vrows.length) party = vrows[0];
        } else if (po.party_type === "farmer" && po.farmer_id) {
          const [frows] = await conn.query(
            `SELECT name, COALESCE(balance,0) AS balance, COALESCE(min_balance,0) AS min_balance
            FROM farmers WHERE id=?`,
            [po.farmer_id]
          );
          if (frows.length) party = frows[0];
        }

        const header = {
          party_type: po.party_type || "vendor",
          vendor_id: po.vendor_id || null,
          farmer_id: po.farmer_id || null,
          address: po.address || "",
          mobile_no: po.mobile_no || "",
          gst_no: po.gst_no || "",
          terms_condition: po.terms_condition || "",
          party_name: party.name || "",
          party_balance: Number(party.balance || 0),
          party_min_balance: Number(party.min_balance || 0),
        };

        const [itemRows] = await conn.query(
          `SELECT 
            i.id AS po_item_id,
            i.product_id,
            COALESCE(p.product_name, '') AS item_name,
            COALESCE(i.hsn_code, p.hsn_code, '') AS hsn_code,
            i.qty,
            i.rate,
            i.discount_rate,
            i.gst_percent
          FROM purchase_order_items i
          LEFT JOIN products p ON p.id = i.product_id
          WHERE i.purchase_order_id = ?
            AND (i.status IS NULL OR i.status <> 'Cancelled')`,
          [id]
        );

        const items = itemRows.map((r) => {
          const qty = toNum(r.qty, 0);
          const pending_qty = qty; // future: qty - received_qty
          return {
            po_item_id: r.po_item_id,
            product_id: r.product_id,
            item_name: r.item_name || "",
            hsn_code: r.hsn_code || "",
            qty,
            pending_qty,
            rate: toNum(r.rate, 0),
            discount_rate: toNum(r.discount_rate, 0),
            gst_percent: toNum(r.gst_percent, 0),
          };
        });

        return res.json({ header, items });
      } catch (err) {
        console.error("getForPurchase error:", err);
        return res.status(500).json({ message: "Internal server error", error: { message: err.message } });
      }
    },
  };

  module.exports = purchaseOrderController;
