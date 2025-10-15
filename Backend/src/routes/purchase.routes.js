const express = require("express");
const purchaseRoutes = express.Router();
const purchaseController = require("../controllers/purchase.controller");

// ✅ Create a new purchase
purchaseRoutes.post("/", purchaseController.create);

// ✅ Get all purchases
purchaseRoutes.get("/", purchaseController.getAll);

// ✅ Get single purchase by ID
purchaseRoutes.get("/:id", purchaseController.getById);

// ✅ Update purchase by ID
purchaseRoutes.put("/:id", purchaseController.update);

module.exports = purchaseRoutes;
