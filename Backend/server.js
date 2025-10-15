require("dotenv").config();
const db = require("./src/config/db");
const app = require("./src/app");

const PORT = Number(process.env.PORT || 5000);

const DDL_INIT_CORE = `
CREATE TABLE IF NOT EXISTS companies (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  address TEXT NULL,
  gst_no VARCHAR(25) NULL,
  contact_no VARCHAR(20) NULL,
  email VARCHAR(120) NULL,
  owner_name VARCHAR(120) NULL,
  status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;`;

const DDL_TEMPLATES = [
  // 1) tpl_purchases
  `
CREATE TABLE IF NOT EXISTS tpl_purchases (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  vendor_id INT NULL,
  farmer_id INT NULL,
  gst_no VARCHAR(50) NULL,
  bill_no VARCHAR(50) NOT NULL,
  bill_date DATE NOT NULL,
  party_type ENUM('vendor','farmer') NOT NULL DEFAULT 'vendor',
  linked_po_id INT NULL,
  total_amount DECIMAL(10,2) DEFAULT 0.00,
  status ENUM('Active','Inactive') DEFAULT 'Active',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tpl_purchase_bill (bill_no),
  KEY idx_tpl_purchase_date (bill_date),
  KEY idx_tpl_purchase_vendor (vendor_id)
) ENGINE=InnoDB;`,
  // 2) tpl_purchase_items
  `
CREATE TABLE IF NOT EXISTS tpl_purchase_items (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  purchase_id INT NOT NULL,
  product_id INT NOT NULL,
  po_item_id INT NULL,
  rate DECIMAL(10,2) NOT NULL,
  size DECIMAL(10,2) NOT NULL,
  unit ENUM('KG','GM','PCS','LTR') DEFAULT 'PCS',
  status ENUM('Active','Inactive') DEFAULT 'Active',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  total DECIMAL(10,2) GENERATED ALWAYS AS (rate * size) STORED,
  KEY idx_tpl_pi_purchase (purchase_id),
  KEY idx_tpl_pi_product (product_id)
) ENGINE=InnoDB;`,
  // 3) tpl_sales
  `
CREATE TABLE IF NOT EXISTS tpl_sales (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NULL,
  vendor_id INT NULL,
  farmer_id INT NULL,
  bill_no VARCHAR(50) NOT NULL,
  bill_date DATE NOT NULL,
  party_type ENUM('customer','vendor','farmer') NOT NULL DEFAULT 'customer',
  total_taxable DECIMAL(10,2) DEFAULT 0.00,
  total_gst DECIMAL(10,2) DEFAULT 0.00,
  payment_status ENUM('Paid','Unpaid','Partial') DEFAULT 'Unpaid',
  payment_method ENUM('Cash','Card','Online','Credit Card','UPI') DEFAULT 'Cash',
  remarks TEXT NULL,
  total_amount DECIMAL(10,2) DEFAULT 0.00,
  status ENUM('Active','Inactive') DEFAULT 'Active',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tpl_sales_bill (bill_no),
  KEY idx_tpl_sales_date (bill_date)
) ENGINE=InnoDB;`,
  // 4) tpl_sale_items
  `
CREATE TABLE IF NOT EXISTS tpl_sale_items (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  qty DECIMAL(10,2) NOT NULL,
  discount_rate DECIMAL(10,2) DEFAULT 0.00,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  taxable_amount DECIMAL(10,2) DEFAULT 0.00,
  gst_percent DECIMAL(5,2) DEFAULT 0.00,
  gst_amount DECIMAL(10,2) DEFAULT 0.00,
  net_total DECIMAL(10,2) DEFAULT 0.00,
  unit ENUM('KG','GM','PCS','LTR') DEFAULT 'PCS',
  total DECIMAL(10,2) GENERATED ALWAYS AS (qty * rate) STORED,
  status ENUM('Active','Inactive') DEFAULT 'Active',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_tpl_si_sale (sale_id),
  KEY idx_tpl_si_product (product_id)
) ENGINE=InnoDB;`,
  // 5) tpl_sale_payments
  `
CREATE TABLE IF NOT EXISTS tpl_sale_payments (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  party_type ENUM('customer','vendor','farmer') NULL,
  customer_id INT NULL,
  vendor_id INT NULL,
  farmer_id INT NULL,
  payment_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method ENUM('Cash','Card','Online','Credit Card','UPI') DEFAULT 'Cash',
  remarks TEXT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_tpl_payments_sale (sale_id),
  KEY idx_tpl_payments_party (customer_id, payment_date)
) ENGINE=InnoDB;`,
];

function exec(sql) {
  return new Promise((resolve, reject) => db.query(sql, (e) => (e ? reject(e) : resolve())));
}

(async () => {
  try {
    await exec(DDL_INIT_CORE);
    for (const stmt of DDL_TEMPLATES) {
      await exec(stmt); // run each CREATE separately
    }
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (e) {
    console.error("Bootstrap failed:", e);
    process.exit(1);
  }
})();
