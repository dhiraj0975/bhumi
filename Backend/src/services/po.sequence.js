const db = require("../config/db");

function q(sql, params=[]) {
  return new Promise((res, rej) => db.query(sql, params, (e, r) => e ? rej(e) : res(r)));
}

async function next(name, { prefix = "PO-", pad = 6 } = {}) {
  // ensure row exists
  await q(
    "INSERT INTO sequences (name, value) VALUES (?, 0) ON DUPLICATE KEY UPDATE name = name",
    [name]
  );

  return new Promise((resolve, reject) => {
    db.beginTransaction(async (err) => {
      if (err) return reject(err);
      try {
        await q("UPDATE sequences SET value = value + 1 WHERE name = ?", [name]);
        const rows = await q("SELECT value FROM sequences WHERE name = ? FOR UPDATE", [name]);
        if (!rows || !rows[0]) throw new Error("Sequence row not found");
        const num = String(rows[0].value).padStart(Number(pad) || 6, "0");
        const out = `${prefix || "PO-"}${num}`;
        db.commit((e3) => e3 ? db.rollback(() => reject(e3)) : resolve(out));
      } catch (e) {
        db.rollback(() => reject(e));
      }
    });
  });
}

module.exports = { next };
