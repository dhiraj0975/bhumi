// const FarmerModel = require("../models/farmerModel");

// // =================  Create =================
// const createFarmer = (req, res) => {
//   const {
//     name,
//     father_name,
//     district,
//     tehsil,
//     patwari_halka,
//     village,
//     contact_number,
//     khasara_number,
//     bank,
//     status
//   } = req.body;

//   console.log("reached at the controller");
  

//   FarmerModel.createFarmer(
//     {
//       name,
//       father_name,
//       district,
//       tehsil,
//       patwari_halka,
//       village,
//       contact_number,
//       khasara_number,
//       status: status || "active", // ✅ default active
//     },
//     bank,
//     (err) => {
//       if (err) return res.status(500).json(err);
//       res.json({ message: "Farmer added successfully!" });
//     }
//   );
// };

// // =============== Read ==================
// const getFarmers = (req, res) => {
//   FarmerModel.getFarmers((err, results) => {
//     if (err) return res.status(500).json(err);
//     res.json(results);
//   });
// };

// // =============== Update ==================
// const updateFarmer = (req, res) => {
//   const farmer_id = req.params.id;
//   const {
//     name,
//     father_name,
//     district,
//     tehsil,
//     patwari_halka,
//     village,
//     contact_number,
//     khasara_number,
//     bank,
//     status
//   } = req.body;

//   FarmerModel.updateFarmer(
//     farmer_id,
//     {
//       name,
//       father_name,
//       district,
//       tehsil,
//       patwari_halka,
//       village,
//       contact_number,
//       khasara_number,
//       status,
//     },
//     bank,
//     (err) => {
//       if (err) return res.status(500).json(err);
//       res.json({ message: "Farmer updated successfully!" });
//     }
//   );
// };

// // =============== Delete ==================
// const deleteFarmer = (req, res) => {
//   const farmer_id = req.params.id;

//   FarmerModel.deleteFarmer(farmer_id, (err) => {
//     if (err) return res.status(500).json(err);
//     res.json({ message: "Farmer deleted successfully!" });
//   });
// };

// // =============== Update Status (Active/Inactive) ==================
// const updateFarmerStatus = (req, res) => {
//   const farmer_id = req.params.id;
//   const { status } = req.body;

//   // Convert to lowercase and validate
//   const normalizedStatus = status.toLowerCase();
//   if (!["active", "inactive"].includes(normalizedStatus)) {
//     return res.status(400).json({ message: "Invalid status value" });
//   }

//   FarmerModel.updateFarmerStatus(farmer_id, normalizedStatus, (err) => {
//     if (err) return res.status(500).json(err);
//     res.json({ message: `Farmer status updated to ${normalizedStatus}` });
//   });
// };

// module.exports = {
//   createFarmer,
//   getFarmers,
//   updateFarmer,
//   deleteFarmer,
//   updateFarmerStatus,
// };



const FarmerModel = require("../models/farmerModel");

// Helper: normalize any incoming status to DB enum values
const toDbStatus = (s) => {
  const x = (s || "").toString().toLowerCase();
  if (x === "active") return "Active";
  if (x === "inactive") return "Inactive";
  return undefined;
};

// Create
const createFarmer = (req, res) => {
  const {
    name, father_name, district, tehsil, patwari_halka, village,
    contact_number, khasara_number, bank, status, balance, min_balance
  } = req.body;

  const dbStatus = toDbStatus(status) || "Active";

  FarmerModel.createFarmer(
    {
      name, father_name, district, tehsil, patwari_halka, village,
      contact_number, khasara_number, status: dbStatus,
      balance, min_balance
    },
    bank,
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Farmer added successfully!" });
    }
  );
};

// Read
const getFarmers = (req, res) => {
  FarmerModel.getFarmers((err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// Update
const updateFarmer = (req, res) => {
  const farmer_id = req.params.id;
  const {
    name, father_name, district, tehsil, patwari_halka, village,
    contact_number, khasara_number, bank, status, balance, min_balance
  } = req.body;

  const dbStatus = toDbStatus(status); // undefined allowed -> model can COALESCE to keep existing

  FarmerModel.updateFarmer(
    farmer_id,
    {
      name, father_name, district, tehsil, patwari_halka, village,
      contact_number, khasara_number,
      status: dbStatus ?? undefined,
      balance, min_balance
    },
    bank,
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Farmer updated successfully!" });
    }
  );
};

// Delete
const deleteFarmer = (req, res) => {
  const farmer_id = req.params.id;
  FarmerModel.deleteFarmer(farmer_id, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Farmer deleted successfully!" });
  });
};

// Update Status
const updateFarmerStatus = (req, res) => {
  const farmer_id = req.params.id;
  const dbStatus = toDbStatus(req.body.status);
  if (!dbStatus) {
    return res.status(400).json({ message: "Invalid status value" });
  }
  FarmerModel.updateFarmerStatus(farmer_id, dbStatus, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: `Farmer status updated to ${dbStatus}` });
  });
};

module.exports = {
  createFarmer,
  getFarmers,
  updateFarmer,
  deleteFarmer,
  updateFarmerStatus,
};
