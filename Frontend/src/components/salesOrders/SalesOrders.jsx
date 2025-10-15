import React, { useState } from "react";
import CreateSalesOrder from "./CreateSalesOrder";
import SalesOrderList from "./SalesOrderList";

export default function SalesOrders() {
  const [editing, setEditing] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen  bg-gray-100">
      <h2 className="text-2xl bg-white px-2 py-2 rounded-md  font-bold mb-4">Sales Orders</h2>

      <div className="mb-6 bg-white rounded shadow p-4">
        <CreateSalesOrder
          so={editing}
          onSaved={() => {
            setEditing(null);
            setRefreshKey((k) => k + 1); // trigger list reload
          }}
        />
      </div>

      <div className="bg-white rounded shadow p-4">
        <SalesOrderList
          key={refreshKey}    // optional: remount on refresh
          refreshKey={refreshKey}
          onEdit={(so) => setEditing(so)}
        />
      </div>
    </div>
  );
}
