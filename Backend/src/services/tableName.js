function tn(code, base) {
  const safe = String(code || '').trim().toLowerCase();
  if (!safe || !/^[a-z0-9_]+$/.test(safe)) throw new Error('invalid company code');
  return `${base}_${safe}`;
}
module.exports = { tn };
