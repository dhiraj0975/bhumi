const express = require("express");
const SalesOrderRouter = express.Router();
const salesOrderController = require("../controllers/salesOrder.controller");

// Create SO (header + items)
SalesOrderRouter.post("/", salesOrderController.create);

// Get all SOs (grouped + summary)
SalesOrderRouter.get("/", salesOrderController.getAll);

// Get single SO
SalesOrderRouter.get("/:id", salesOrderController.getById);

// Update SO (header + upsert items)
SalesOrderRouter.put("/:id", salesOrderController.update);

// Delete SO (items then header)
SalesOrderRouter.delete("/:id", salesOrderController.delete);

// Invoice payload
SalesOrderRouter.get("/:id/invoice", salesOrderController.getInvoice);

module.exports = SalesOrderRouter;
