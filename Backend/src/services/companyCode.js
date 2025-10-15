function normalize(code) {
  if (!code) return '';
  let cc = String(code || '').trim().toLowerCase();
  cc = cc.replace(/[^a-z0-9_]+/g, '_');
  cc = cc.replace(/_+/g, '_');
  cc = cc.replace(/^_+|_+$/g, '');
  return cc;
}
module.exports = { normalize };
