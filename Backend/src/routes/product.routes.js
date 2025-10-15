const express = require("express");
const productRoutes = express.Router();
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct } = require("../controllers/product.Controller");

productRoutes.post("/", createProduct);     // Add new product row (size/discount)
productRoutes.get("/", getProducts);        // Get all products (with category)
productRoutes.get("/:id", getProductById);  // Get one product row
productRoutes.put("/:id", updateProduct);   // Update one product row
productRoutes.delete("/:id", deleteProduct);// Delete one product row

module.exports = productRoutes;
