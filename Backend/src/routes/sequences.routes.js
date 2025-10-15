const express = require('express');
const router = express.Router();
const { getNext } = require('../controllers/sequences.controller');

// app.js pe /api/sequences already protected hai; yahan extra auth zaroori nahi
router.get('/next', getNext);

router.get('/next/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { prefix = "PO-", pad = 6 } = req.query;
    const { next } = require('../services/sequence');
    const value = await next(name, { prefix, pad: Number(pad) || 6 });
    res.json({ value });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
