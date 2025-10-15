// routes/sequences.routes.js already exists
// controllers/sequences.controller.js
const { next } = require("../services/sequence");
module.exports.getNext = async (req, res) => {
  try {
    const { key = "po", prefix = "PO-", pad = 6 } = req.query;
    const value = await next(key, { prefix, pad: Number(pad) || 6 });
    res.json({ value });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
