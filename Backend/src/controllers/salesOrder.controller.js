const SalesOrder = require("../models/salesOrder.model");
const SalesOrderItem = require("../models/salesOrderItem.model");

// numeric helper
const toNum = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

// calc same as PO (percent-per-qty of rate)
const calcItem = (it) => {
  const qty = toNum(it.qty);
  const rate = toNum(it.rate);
  const amount = qty * rate;

  const discRatePerUnit = (rate * toNum(it.discount_per_qty)) / 100;
  const discTotal = discRatePerUnit * qty;

  const taxable = amount - discTotal;
  const gst_amount = (taxable * toNum(it.gst_percent)) / 100;
  const final_amount = taxable + gst_amount;

  return {
    amount: Number(amount.toFixed(2)),
    discount_rate: Number(discRatePerUnit.toFixed(2)),
    discount_total: Number(discTotal.toFixed(2)),
    gst_amount: Number(gst_amount.toFixed(2)),
    final_amount: Number(final_amount.toFixed(2)),
  };
};

const salesOrderController = {
  // Create SO (header + items)
  create: async (req, res) => {
    try {
      const {
        so_no,
        customer_id,
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

      if (!customer_id) return res.status(400).json({ error: "customer_id is required" });
      if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "items are required" });

      // header totals from items
      let totalAmount = 0, totalGST = 0, finalAmount = 0;
      const computed = items.map((it) => {
        const c = calcItem(it);
        totalAmount += c.amount - c.discount_total;
        totalGST += c.gst_amount;
        finalAmount += c.final_amount;
        return { raw: it, calc: c };
      });

      const header = {
        so_no,
        customer_id: Number(customer_id),
        date,
        bill_time,
        address: address || "",
        mobile_no: mobile_no || "",
        gst_no: gst_no || "",
        place_of_supply: place_of_supply || "",
        terms_condition: terms_condition || "",
        total_amount: Number(totalAmount.toFixed(2)),
        gst_amount: Number(totalGST.toFixed(2)),
        final_amount: Number(finalAmount.toFixed(2)),
        status: status || "Issued",
      };

      let headerResult;
      try {
        headerResult = await SalesOrder.create(header);
      } catch (e) {
        if (e.code === "ER_DUP_ENTRY" && String(e.sqlMessage || "").includes("sales_orders.so_no")) {
          return res.status(409).json({ error: "SO number already exists. Please use a unique SO No." });
        }
        throw e;
      }
      const sales_order_id = headerResult.insertId;

      const createdItems = [];
      for (const { raw } of computed) {
        // Generated columns DB me auto compute honge
        const data = {
          sales_order_id,
          product_id: Number(raw.product_id),
          hsn_code: raw.hsn_code || "",
          qty: Number(raw.qty || 0),
          rate: Number(raw.rate || 0),
          discount_per_qty: Number(raw.discount_per_qty || 0),
          gst_percent: Number(raw.gst_percent || 0),
          status: raw.status || "Active",
        };
        const itemRes = await SalesOrderItem.create(data);
        createdItems.push({ id: itemRes.insertId, ...data });
      }

      return res.status(201).json({
        message: "Sales Order created successfully",
        sales_order: {
          id: sales_order_id,
          ...header,
          items: createdItems,
          summary: {
            total_taxable: Number(totalAmount.toFixed(2)),
            total_gst: Number(totalGST.toFixed(2)),
            grand_total: Number(finalAmount.toFixed(2)),
          },
        },
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message });
    }
  },

  // Get all SOs (grouped + summary)
  getAll: async (_req, res) => {
    try {
      const rows = await SalesOrder.getAllRaw();
      const map = {};
      for (const r of rows) {
        const id = r.sales_order_id;
        if (!map[id]) {
          map[id] = {
            id,
            so_no: r.so_no,
            customer_name: r.customer_name,
            date: r.date,
            bill_time: r.bill_time,
            address: r.address,
            mobile_no: r.mobile_no,
            gst_no: r.gst_no,
            place_of_supply: r.place_of_supply,
            terms_condition: r.terms_condition,
            status: r.status,
            items: [],
            summary: { total_taxable: 0, total_gst: 0, grand_total: 0 },
          };
        }
        map[id].items.push({
          id: r.item_id,
          product_id: r.product_id,
          product_name: r.product_name,
          hsn_code: r.hsn_code,
          qty: Number(r.qty),
          rate: Number(r.rate),
          amount: Number(r.amount),
          discount_per_qty: Number(r.discount_per_qty),
          discount_rate: Number(r.discount_rate),
          discount_total: Number(r.discount_total),
          gst_percent: Number(r.gst_percent),
          gst_amount: Number(r.item_gst),
          final_amount: Number(r.item_final),
        });
        map[id].summary.total_taxable += Number(r.amount) - Number(r.discount_total);
        map[id].summary.total_gst += Number(r.item_gst);
        map[id].summary.grand_total += Number(r.item_final);
      }
      const list = Object.values(map).map((x) => ({
        ...x,
        summary: {
          total_taxable: Number(x.summary.total_taxable.toFixed(2)),
          total_gst: Number(x.summary.total_gst.toFixed(2)),
          grand_total: Number(x.summary.grand_total.toFixed(2)),
        },
      }));
      return res.json(list);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message });
    }
  },

  // Get single SO (head + items + computed summary)
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const headRows = await SalesOrder.getById(id);
      if (headRows.length === 0) return res.status(404).json({ message: "SO not found" });

      const items = await SalesOrderItem.getBySOId(id);
      const summary = items.reduce(
        (a, it) => {
          a.total_taxable += Number(it.amount) - Number(it.discount_total);
          a.total_gst += Number(it.gst_amount);
          a.grand_total += Number(it.final_amount);
          return a;
        },
        { total_taxable: 0, total_gst: 0, grand_total: 0 }
      );

      return res.json({
        ...headRows[0],
        items,
        summary: {
          total_taxable: Number(summary.total_taxable.toFixed(2)),
          total_gst: Number(summary.total_gst.toFixed(2)),
          grand_total: Number(summary.grand_total.toFixed(2)),
        },
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message });
    }
  },

  // Update SO (header + upsert items)
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        so_no,
        customer_id,
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

      if (!customer_id) return res.status(400).json({ error: "customer_id is required" });
      if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "items are required" });

      // recompute header totals
      let totalAmount = 0, totalGST = 0, finalAmount = 0;
      const computed = items.map((it) => {
        const c = calcItem(it);
        totalAmount += c.amount - c.discount_total;
        totalGST += c.gst_amount;
        finalAmount += c.final_amount;
        return { raw: it, calc: c };
      });

      await SalesOrder.updateHeader(id, {
        so_no,
        customer_id: Number(customer_id),
        date,
        bill_time,
        address: address || "",
        mobile_no: mobile_no || "",
        gst_no: gst_no || "",
        place_of_supply: place_of_supply || "",
        terms_condition: terms_condition || "",
        total_amount: Number(totalAmount.toFixed(2)),
        gst_amount: Number(totalGST.toFixed(2)),
        final_amount: Number(finalAmount.toFixed(2)),
        status: status || "Issued",
      });

      for (const { raw } of computed) {
        const data = {
          product_id: Number(raw.product_id),
          hsn_code: raw.hsn_code || "",
          qty: Number(raw.qty || 0),
          rate: Number(raw.rate || 0),
          discount_per_qty: Number(raw.discount_per_qty || 0),
          gst_percent: Number(raw.gst_percent || 0),
          status: raw.status || "Active",
        };
        if (raw.id) {
          await SalesOrderItem.update(raw.id, data);
        } else {
          await SalesOrderItem.create({ sales_order_id: id, ...data });
        }
      }

      return res.json({ message: "Sales Order updated successfully" });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message });
    }
  },

  // Delete SO (items then header)
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      await SalesOrderItem.deleteBySOId(id);
      await SalesOrder.delete(id);
      return res.json({ message: "Sales Order deleted successfully" });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message });
    }
  },

  // Invoice payload (customer join safe)
// controllers/salesOrder.controller.js

getInvoice: async (req, res) => {
  try {
    const { id } = req.params;

    // Deterministic head with customer
    const headRows = await SalesOrder.getByIdWithCustomer(id);
    if (!headRows || headRows.length === 0) {
      return res.status(404).json({ message: "SO not found" });
    }
    const head = headRows[0];

    // Items
    const items = await SalesOrderItem.getBySOId(id);

    const summary = items.reduce(
      (a, it) => {
        a.total_taxable += Number(it.amount) - Number(it.discount_total);
        a.total_gst += Number(it.gst_amount);
        a.grand_total += Number(it.final_amount);
        return a;
      },
      { total_taxable: 0, total_gst: 0, grand_total: 0 }
    );

    return res.json({
      invoiceNo: `SIN-${head.id}`,
      date: head.date,
      customer: {
        name: head.customer_name || "",
        address: head.address,
        gst_no: head.gst_no,
      },
      items,
      summary: {
        total_taxable: Number(summary.total_taxable.toFixed(2)),
        total_gst: Number(summary.total_gst.toFixed(2)),
        grand_total: Number(summary.grand_total.toFixed(2)),
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
},


};

module.exports = salesOrderController;
