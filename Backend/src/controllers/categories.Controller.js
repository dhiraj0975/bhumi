const Category = require("../models/categoriesModel");

// Get all categories
const getCategories = (req, res) => {
  Category.getAll((err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
};

// Create new category (default Active if not provided)
const createCategory = (req, res) => {
  const { name, status = "Active" } = req.body;

  Category.create(name, status, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Category created", id: result.insertId, status });
  });
};


// Update category (name + status both can be updated)
const updateCategory = (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body;

  // if status is missing, keep it Active by default
  const newStatus = status || "Active";

  Category.update(id, name, newStatus, (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Category updated", id, status: newStatus });
  });
};

// ✅ Update only status (toggle Active/Inactive)
const updateCategoryStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required (Active/Inactive)" });
  }

  Category.updateStatus(id, status, (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Category status updated", id, status });
  });
};

// Delete category
const deleteCategory = (req, res) => {
  const { id } = req.params;
  Category.delete(id, (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Category deleted" });
  });
};

module.exports = { 
  getCategories, 
  createCategory, 
  updateCategory, 
  updateCategoryStatus, // 🔥 new method
  deleteCategory 
};
