import React, { useState } from "react";
import PurchaseOrderForm from "./PurchaseOrderForm";
import PurchaseOrderList from "./PurchaseOrderList";

export default function PurchaseOrders() {
  const [editingPO, setEditingPO] = useState(null);

  const handleEdit = (po) => setEditingPO(po);
  const handleFormSubmit = () => setEditingPO(null);

  return (
    <div className="min-h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Purchase Orders</h2>

      {/* Form */}
      <div className="mb-6 bg-white rounded shadow p-4">
        <PurchaseOrderForm purchaseOrder={editingPO} onSubmitted={handleFormSubmit} />
      </div>

      {/* List below */}
      <div className="bg-white rounded shadow p-4">
        <PurchaseOrderList onEdit={handleEdit} />
      </div>
    </div>
  );
}
