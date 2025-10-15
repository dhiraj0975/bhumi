import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFarmers } from "../features/farmers/farmerSlice";
import FarmerRegistrationForm from "../components/Farmer/FarmerRegistrationForm";
import FarmerList from "../components/Farmer/FarmerList";
import { Tractor, UserCheck, UserX } from "lucide-react";

export default function FarmerRegistrationPage() {
  const dispatch = useDispatch();
  const { list: farmers } = useSelector((state) => state.farmers);
  const [activeTab, setActiveTab] = useState("form");
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  useEffect(() => {
    dispatch(fetchFarmers());
  }, [dispatch]);

  // Calculate farmer stats
  const totalFarmers = farmers.length;
  const activeFarmers = farmers.filter(farmer => 
    (farmer.status || "").toString().toLowerCase() === 'active'
  ).length;
  const inactiveFarmers = totalFarmers - activeFarmers;

  const handleEditFarmer = (farmer) => {
    setSelectedFarmer(farmer);
    setActiveTab("form");
  };

  const handleCloseForm = () => {
    setSelectedFarmer(null);
    setActiveTab("list");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg text-white flex items-center gap-4">
          <Tractor size={36} />
          <div>
            <p className="text-sm opacity-80">Total Farmers</p>
            <h3 className="text-2xl font-bold">{totalFarmers}</h3>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg text-white flex items-center gap-4">
          <UserCheck size={36} />
          <div>
            <p className="text-sm opacity-80">Active Farmers</p>
            <h3 className="text-2xl font-bold">{activeFarmers}</h3>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 shadow-lg text-white flex items-center gap-4">
          <UserX size={36} />
          <div>
            <p className="text-sm opacity-80">Inactive Farmers</p>
            <h3 className="text-2xl font-bold">{inactiveFarmers}</h3>
          </div>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-4">
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === "form" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => {
            setActiveTab("form");
            setSelectedFarmer(null);
          }}
        >
          {selectedFarmer ? "Update Farmer" : "Farmer Registration"}
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === "list" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("list")}
        >
          Farmer List
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "form" ? (
        <FarmerRegistrationForm 
          selectedFarmer={selectedFarmer} 
          onClose={handleCloseForm} 
        />
      ) : (
        <FarmerList onEdit={handleEditFarmer} />
      )}
    </div>
  );
}
