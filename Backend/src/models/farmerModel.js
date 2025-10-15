const db = require("../config/db");

// Create
const createFarmer = (farmerData, bankData, callback) => {
  const farmerQuery = `
    INSERT INTO farmers
      (name, father_name, district, tehsil, patwari_halka, village, contact_number, khasara_number, status, balance, min_balance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, DEFAULT(balance)), COALESCE(?, DEFAULT(min_balance)))
  `;
  db.query(
    farmerQuery,
    [
      farmerData.name,
      farmerData.father_name,
      farmerData.district,
      farmerData.tehsil,
      farmerData.patwari_halka,
      farmerData.village,
      farmerData.contact_number,
      farmerData.khasara_number,
      farmerData.status || "Active",
      farmerData.balance,        // undefined => DEFAULT via COALESCE
      farmerData.min_balance     // undefined => DEFAULT via COALESCE
    ],
    (err, result) => {
      if (err) return callback(err);

      const farmer_id = result.insertId;
      const safeBank = {
        pan_number: (bankData && bankData.pan_number) || "",
        account_holder_name: (bankData && bankData.account_holder_name) || "",
        bank_name: (bankData && bankData.bank_name) || "",
        account_number: (bankData && bankData.account_number) || "",
        ifsc_code: (bankData && bankData.ifsc_code) || "",
        branch_name: (bankData && bankData.branch_name) || "",
      };

      const bankQuery = `
        INSERT INTO farmer_bank_details 
        (farmer_id, pan_number, account_holder_name, bank_name, account_number, ifsc_code, branch_name) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(
        bankQuery,
        [
          farmer_id,
          safeBank.pan_number,
          safeBank.account_holder_name,
          safeBank.bank_name,
          safeBank.account_number,
          safeBank.ifsc_code,
          safeBank.branch_name,
        ],
        callback
      );
    }
  );
};

// Read
const getFarmers = (callback) => {
  const query = `
    SELECT f.id, f.name, f.father_name, f.district, f.tehsil, f.patwari_halka, f.village,
           f.contact_number, f.khasara_number, f.status,
           f.balance, f.min_balance,
           b.pan_number, b.account_holder_name, b.bank_name, b.account_number, b.ifsc_code, b.branch_name
    FROM farmers f
    LEFT JOIN farmer_bank_details b ON f.id = b.farmer_id
  `;
  db.query(query, callback);
};

// Update
const updateFarmer = (farmer_id, farmerData, bankData, callback) => {
const farmerQuery = `
  UPDATE farmers
  SET name=?, father_name=?, district=?, tehsil=?, patwari_halka=?, village=?, contact_number=?, khasara_number=?,
      status=COALESCE(?, status),
      balance=COALESCE(?, balance),
      min_balance=COALESCE(?, min_balance)
  WHERE id=?
`;
db.query(
  farmerQuery,
  [
    farmerData.name,
    farmerData.father_name,
    farmerData.district,
    farmerData.tehsil,
    farmerData.patwari_halka,
    farmerData.village,
    farmerData.contact_number,
    farmerData.khasara_number,
    // status: allow undefined to keep existing
    farmerData.status,
    farmerData.balance,
    farmerData.min_balance,
    farmer_id,
  ],
  // ...
);

};

// Delete
const deleteFarmer = (farmer_id, callback) => {
  db.query("DELETE FROM farmers WHERE id=?", [farmer_id], callback);
};

// Status
const updateFarmerStatus = (farmer_id, status, callback) => {
  db.query("UPDATE farmers SET status=? WHERE id=?", [status, farmer_id], callback);
};

module.exports = {
  createFarmer,
  getFarmers,
  updateFarmer,
  deleteFarmer,
  updateFarmerStatus
};
