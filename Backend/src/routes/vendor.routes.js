const express = require("express");
const { body, validationResult } = require("express-validator");
const {
  createVendor, getVendors, updateVendor, deleteVendor, updateVendorStatus
} = require("../controllers/vendor.Controller");

const vendorRoutes = express.Router();

const vendorRules = [
  body("vendor_name").optional().isString().trim(),
  body("firm_name").notEmpty().isString().trim(),
  body("gst_no").notEmpty().isString().trim(),
  body("address").optional().isString(),
  body("contact_number").optional().isString(),
  body("status").optional().isIn(["active","inactive"]),
  body("balance").optional().isFloat({ min: 0 }),
  body("min_balance").optional().isFloat({ min: 0 }),
];

function runValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
}

vendorRoutes.post("/", vendorRules, runValidation, createVendor);
vendorRoutes.get("/", getVendors);
vendorRoutes.put("/:id", vendorRules, runValidation, updateVendor);
vendorRoutes.delete("/:id", deleteVendor);
vendorRoutes.patch("/:id/status", updateVendorStatus);

module.exports = vendorRoutes;
