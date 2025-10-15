const db = require("../config/db");
const { tn } = require("./tableName");

function run(sql) {
  return new Promise((resolve, reject) => db.query(sql, (e) => (e ? reject(e) : resolve())));
}
async function createCompanyTables(code) {
  const ddl = [
    `CREATE TABLE IF NOT EXISTS \`${tn(code,'purchases')}\` LIKE \`tpl_purchases\``,
    `CREATE TABLE IF NOT EXISTS \`${tn(code,'purchase_items')}\` LIKE \`tpl_purchase_items\``,
    `CREATE TABLE IF NOT EXISTS \`${tn(code,'sales')}\` LIKE \`tpl_sales\``,
    `CREATE TABLE IF NOT EXISTS \`${tn(code,'sale_items')}\` LIKE \`tpl_sale_items\``,
    `CREATE TABLE IF NOT EXISTS \`${tn(code,'sale_payments')}\` LIKE \`tpl_sale_payments\``,
  ];
  for (const q of ddl) await run(q);
}
module.exports = { createCompanyTables };
