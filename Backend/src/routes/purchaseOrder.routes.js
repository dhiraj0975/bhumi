// routes/purchaseOrder.routes.js
const express = require("express");
const PurchaseOrderRouter = express.Router();
const purchaseOrderController = require("../controllers/purchaseOrder.controller");

// Create PO (header + items)
PurchaseOrderRouter.post("/", purchaseOrderController.create);

// Get all POs (grouped with items + summary)
PurchaseOrderRouter.get("/", purchaseOrderController.getAll);

// Get single PO (header + items + summary)
PurchaseOrderRouter.get("/:id", purchaseOrderController.getById);

// Update PO (header + upsert items)
PurchaseOrderRouter.put("/:id", purchaseOrderController.update);

// Delete PO (cascade delete items first)
PurchaseOrderRouter.delete("/:id", purchaseOrderController.delete);

// Generate invoice payload from PO
PurchaseOrderRouter.get("/:id/invoice", purchaseOrderController.getInvoice);


// NEW: PO → Purchase prefill
PurchaseOrderRouter.get("/:id/for-purchase", purchaseOrderController.getForPurchase);



module.exports = PurchaseOrderRouter;
