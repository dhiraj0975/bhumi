const Company = require('../models/company.model');
const { createCompanyTables } = require('../services/companyTables');

exports.create = async (req, res) => {
  try {
  const { code, name, address, gst_no, contact_no, email, owner_name } = req.body;
  // normalize: trim, lowercase, replace spaces and invalid chars with underscore
  let cc = String(code || '').trim().toLowerCase();
  // Replace any character that's not a-z, 0-9 or underscore with underscore
  cc = cc.replace(/[^a-z0-9_]+/g, '_');
  // Collapse multiple underscores
  cc = cc.replace(/_+/g, '_');
  // Strip leading/trailing underscores
  cc = cc.replace(/^_+|_+$/g, '');
  if (!cc || !/^[a-z0-9_]+$/.test(cc)) return res.status(400).json({ error: 'invalid code' });
    if (!name) return res.status(400).json({ error: 'name required' });

    await Company.create({ code: cc, name, address, gst_no, contact_no, email, owner_name });
    await createCompanyTables(cc);
    res.status(201).json({ message: 'Company created', code: cc });
  } catch (e) { res.status(400).json({ error: e.message }); }
};

exports.list = async (_req, res) => {
  try { res.json(await Company.list()); }
  catch (e) { res.status(500).json({ error: e.message }); }
};
