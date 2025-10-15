import React from "react";
import { useNavigate } from "react-router-dom";
import PurchaseForm from "../../components/purchase/PurchaseForm";

export default function PurchaseEdit() {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4">Update Purchase</h1>

      {/* PurchaseForm reads poId from useParams internally */}
      <div className="bg-white p-4 rounded shadow">
        <PurchaseForm />
      </div>
    </div>
  );
}
