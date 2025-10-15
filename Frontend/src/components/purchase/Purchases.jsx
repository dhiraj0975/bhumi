import React, { useState } from "react";
import { pick as pickCompanyColor } from "../../utils/companyColor";
import PurchaseForm from "./PurchaseForm";
import PurchaseList from "./PurchaseList";

export default function Purchases() {
  const [reloadFlag, setReloadFlag] = useState(0);

  const handlePurchaseSaved = () => {
    setReloadFlag((prev) => prev + 1);
  };

  return (
    <div className=" bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6 bg-white p-3 shadow-md">
        <h1 className="text-2xl font-bold">Manage Purchases</h1>
        <div>
          {(() => {
            const code = (localStorage.getItem("company_code") || "").toLowerCase();
            const { bg, text } = pickCompanyColor(code);
            return (
              <div className={`inline-flex fixed right-2  opacity-50 items-center gap-3 px-3 py-2 rounded-lg ${bg} ${text}`}>
                <div className="text-lg font-semibold">{(code || "(none)").toUpperCase()}</div>
                <div className="text-lg bg-white/20 px-2 py-0.5 rounded-full">Company</div>
              </div>
            );
          })()}
        </div>
      </div>
      
      {/* Purchase Form */}
      <div className="mb-10">
        <PurchaseForm onSaved={handlePurchaseSaved} />
      </div>

      {/* Purchase List */}
      <div>
        <PurchaseList reload={reloadFlag} />
      </div>
    </div>
  );
}
