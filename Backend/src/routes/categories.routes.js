const express = require("express");
const { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  updateCategoryStatus // 👈 ye bhi import karna hoga
} = require("../controllers/categories.Controller");

const categoryRoutes = express.Router();

categoryRoutes.get("/", getCategories);
categoryRoutes.post("/", createCategory);
categoryRoutes.put("/:id", updateCategory);
categoryRoutes.patch("/:id/status", updateCategoryStatus);
categoryRoutes.delete("/:id", deleteCategory);

module.exports = categoryRoutes;
