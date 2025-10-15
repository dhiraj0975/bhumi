// src/components/Farmers/FarmerRegister.jsx
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addFarmer, updateFarmer } from "../../features/farmers/farmerSlice";

export default function FarmerRegister({ selectedFarmer, onClose }) {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    father_name: "",
    district: "",
    tehsil: "",
    patwari_halka: "",
    village: "",
    contact_number: "",
    khasara_number: "",
    balance: "",         // ADDED
    min_balance: "5000", // ADDED
    status: "active",
  });

  // Prefill on edit
  useEffect(() => {
    if (selectedFarmer) {
      setFormData({
        name: selectedFarmer.name || "",
        father_name: selectedFarmer.father_name || "",
        district: selectedFarmer.district || "",
        tehsil: selectedFarmer.tehsil || "",
        patwari_halka: selectedFarmer.patwari_halka || "",
        village: selectedFarmer.village || "",
        contact_number: selectedFarmer.contact_number || "",
        khasara_number: selectedFarmer.khasara_number || "",
        balance: selectedFarmer.balance ?? "",
        min_balance: selectedFarmer.min_balance ?? "5000",
        status: (selectedFarmer.status || "active").toString().toLowerCase(),
      });
    }
  }, [selectedFarmer]);

  // Unified change handler
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // Keep controlled input values as strings; convert at submit [web:200][web:190]
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? value : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert numeric fields; empty string -> undefined to trigger DB defaults [web:200][web:97]
    const payload = {
      ...formData,
      balance: formData.balance === "" ? undefined : Number(formData.balance),
      min_balance: formData.min_balance === "" ? undefined : Number(formData.min_balance),
    };

    if (selectedFarmer) {
      dispatch(updateFarmer({ id: selectedFarmer.id, data: payload }));
    } else {
      dispatch(addFarmer(payload));
    }

    // Reset and close
    setFormData({
      name: "",
      father_name: "",
      district: "",
      tehsil: "",
      patwari_halka: "",
      village: "",
      contact_number: "",
      khasara_number: "",
      balance: "",
      min_balance: "5000",
      status: "active",
    });
    if (onClose) onClose();
  };

  return (
   <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-6 mb-6">
  <h2 className="text-xl font-bold mb-4">
    {selectedFarmer ? "Update Farmer" : "Farmer Registration "}
  </h2>

  {/* 4 inputs per row on md+ screens, responsive to 1 column on small screens */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div className="flex flex-col">
      <label htmlFor="name" className="text-sm font-medium mb-1">Name</label>
      <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="border p-2 rounded-lg" required />
    </div>

    <div className="flex flex-col">
      <label htmlFor="father_name" className="text-sm font-medium mb-1">Father Name</label>
      <input id="father_name" type="text" name="father_name" value={formData.father_name} onChange={handleChange} placeholder="Father Name" className="border p-2 rounded-lg" />
    </div>

    <div className="flex flex-col">
      <label htmlFor="district" className="text-sm font-medium mb-1">District</label>
      <input id="district" type="text" name="district" value={formData.district} onChange={handleChange} placeholder="District" className="border p-2 rounded-lg" />
    </div>

    <div className="flex flex-col">
      <label htmlFor="tehsil" className="text-sm font-medium mb-1">Tehsil</label>
      <input id="tehsil" type="text" name="tehsil" value={formData.tehsil} onChange={handleChange} placeholder="Tehsil" className="border p-2 rounded-lg" />
    </div>

    <div className="flex flex-col">
      <label htmlFor="patwari_halka" className="text-sm font-medium mb-1">Patwari Halka</label>
      <input id="patwari_halka" type="text" name="patwari_halka" value={formData.patwari_halka} onChange={handleChange} placeholder="Patwari Halka" className="border p-2 rounded-lg" />
    </div>

    <div className="flex flex-col">
      <label htmlFor="village" className="text-sm font-medium mb-1">Village</label>
      <input id="village" type="text" name="village" value={formData.village} onChange={handleChange} placeholder="Village" className="border p-2 rounded-lg" />
    </div>

    <div className="flex flex-col">
      <label htmlFor="contact_number" className="text-sm font-medium mb-1">Contact Number</label>
      <input id="contact_number" type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} placeholder="Contact Number" className="border p-2 rounded-lg" />
    </div>

    <div className="flex flex-col">
      <label htmlFor="khasara_number" className="text-sm font-medium mb-1">Khasara Number</label>
      <input id="khasara_number" type="text" name="khasara_number" value={formData.khasara_number} onChange={handleChange} placeholder="Khasara Number" className="border p-2 rounded-lg" />
    </div>

    <div className="flex flex-col">
      <label htmlFor="balance" className="text-sm font-medium mb-1">Balance</label>
      <input id="balance" type="number" name="balance" min={0} step="0.01" value={formData.balance} onChange={handleChange} placeholder="Balance" className="border p-2 rounded-lg" />
    </div>

    <div className="flex flex-col">
      <label htmlFor="min_balance" className="text-sm font-medium mb-1">Min Balance</label>
      <input id="min_balance" type="number" name="min_balance" min={0} step="0.01" value={formData.min_balance} onChange={handleChange} placeholder="Min Balance" className="border p-2 rounded-lg" />
    </div>

    <div className="flex flex-col md:col-span-2">
      <label htmlFor="status" className="text-sm font-medium mb-1">Status</label>
      <select id="status" name="status" value={formData.status} onChange={handleChange} className="border p-2 rounded-lg">
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  </div>

  <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
    {selectedFarmer ? "Update" : "Register"}
  </button>
</form>

  );
}
