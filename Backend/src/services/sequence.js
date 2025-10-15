const db = require("../config/db");

// Helpers copied from models to support both pool and single connection
const getConn = () =>
  new Promise((resolve, reject) => {
    if (typeof db.getConnection !== "function") return resolve(db);
    db.getConnection((err, conn) => (err ? reject(err) : resolve(conn)));
  });

const begin = (conn) =>
  new Promise((resolve, reject) => {
    if (!conn.beginTransaction) return resolve();
    conn.beginTransaction((err) => (err ? reject(err) : resolve()));
  });

const exec = (conn, sql, params = []) =>
  new Promise((resolve, reject) => {
    conn.query(sql, params, (err, results) => (err ? reject(err) : resolve([results])));
  });

const commit = (conn) =>
  new Promise((resolve, reject) => {
    if (!conn.commit) return resolve();
    conn.commit((err) => (err ? reject(err) : resolve()));
  });

const rollback = (conn) =>
  new Promise((resolve) => {
    if (!conn.rollback) return resolve();
    conn.rollback(() => resolve());
  });

const release = (conn) => {
  if (typeof conn.release === "function") conn.release();
};

// Next sequence value (atomic)
// name: sequence name (e.g., 'po' or 'so')
// options: { prefix: 'PO', pad: 6 }
async function next(name, options = {}) {
  const prefix = options.prefix || String(name || "").toUpperCase();
  const pad = Number(options.pad || 6);

  const conn = await getConn();
  try {
    await begin(conn);

    // ensure table exists
    await exec(
      conn,
      `CREATE TABLE IF NOT EXISTS sequences (
        name VARCHAR(100) PRIMARY KEY,
        value BIGINT NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      []
    );

    // insert row if missing
    await exec(conn, `INSERT INTO sequences (name, value) VALUES (?, 1) ON DUPLICATE KEY UPDATE name = name`, [name]);

    // lock row and read
    const [rows] = await exec(conn, `SELECT value FROM sequences WHERE name = ? FOR UPDATE`, [name]);
    if (!rows || rows.length === 0) throw new Error("sequence row missing after insert");
    const current = Number(rows[0].value || 0);

    // update to next value
    const nextVal = current + 1;
    await exec(conn, `UPDATE sequences SET value = ? WHERE name = ?`, [nextVal, name]);

    await commit(conn);
    // format: PREFIX-000001
    const formatted = `${prefix}-${String(current).padStart(pad, "0")}`;
    return formatted;
  } catch (e) {
    await rollback(conn);
    throw e;
  } finally {
    release(conn);
  }
}

module.exports = { next };
