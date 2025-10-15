const express = require("express");
const { body, validationResult } = require("express-validator");
const {
  createFarmer, getFarmers, updateFarmer, deleteFarmer, updateFarmerStatus
} = require("../controllers/farmer.Controller");

const farmerRoutes = express.Router();

const farmerRules = [
  body("name").notEmpty().isString().trim(),
  body("father_name").optional().isString().trim(),
  body("district").optional().isString().trim(),
  body("tehsil").optional().isString().trim(),
  body("patwari_halka").optional().isString().trim(),
  body("village").optional().isString().trim(),
  body("contact_number").optional().isString().trim(),
  body("khasara_number").optional().isString().trim(),
  // CHANGE: accept lowercase in request, normalize later in controller
  body("status").optional().toLowerCase().isIn(["active","inactive"]),
  body("balance").optional().toFloat().isFloat({ min: 0 }),
  body("min_balance").optional().toFloat().isFloat({ min: 0 }),
];

function runValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
}

farmerRoutes.post("/", farmerRules, runValidation, createFarmer);
farmerRoutes.get("/", getFarmers);
farmerRoutes.put("/:id", farmerRules, runValidation, updateFarmer);
farmerRoutes.delete("/:id", deleteFarmer);
farmerRoutes.patch("/:id/status", updateFarmerStatus);

module.exports = farmerRoutes;
