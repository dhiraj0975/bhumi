import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PurchaseAPI from "../../axios/purchaseApi";

const fx = (n) => (isNaN(n) ? "0.000" : Number(n).toFixed(3));

export default function PurchaseView() {
  const { poId } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await PurchaseAPI.getById(poId);
        setPurchase(res.data || null);
      } catch (err) {
        console.error("Failed to load purchase", err);
        alert("Failed to load purchase details");
      } finally {
        setLoading(false);
      }
    };
    if (poId) load();
  }, [poId]);

  if (loading) return <div className="p-6">Loading purchase...</div>;
  if (!purchase) return <div className="p-6">Purchase not found</div>;

  const p = purchase;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        ← Back to Purchases
      </button>

      <h1 className="text-3xl font-bold mb-6">Purchase Details - Bill No: {p.bill_no || "N/A"}</h1>

      <div className="mb-4">
        <strong>Vendor:</strong> {p.vendor_name || p.vendor_id || "N/A"}
      </div>
      <div className="mb-4">
        <strong>Date:</strong> {p.bill_date ? new Date(p.bill_date).toLocaleDateString() : "N/A"}
      </div>

      <div className="mb-4">
        <strong>GST No:</strong> {p.gst_no || "N/A"}
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Items</h2>

      <table className="w-full border text-sm">
        <thead className="bg-green-700 text-white">
          <tr>
            <th className="border px-2 py-1">SI</th>
            <th className="border px-2 py-1">Item Name</th>
            <th className="border px-2 py-1">HSNCode</th>
            <th className="border px-2 py-1">Size</th>
            <th className="border px-2 py-1">Rate</th>
            <th className="border px-2 py-1">Discount %</th>
            <th className="border px-2 py-1">GST %</th>
            <th className="border px-2 py-1">Amount</th>
          </tr>
        </thead>
        <tbody>
          {p.items?.map((item, idx) => {
            const base = (item.size || 0) * (item.rate || 0);
            const discAmt = (base * (item.d1_percent || 0)) / 100;
            const taxable = base - discAmt;
            const gstAmt = (taxable * (item.gst_percent || 0)) / 100;
            const finalAmt = taxable + gstAmt;

            return (
              <tr key={idx} className="odd:bg-white even:bg-gray-50">
                <td className="border px-2 py-1">{idx + 1}</td>
                <td className="border px-2 py-1">{item.item_name || item.product_name}</td>
                <td className="border px-2 py-1">{item.hsn_code || ""}</td>
                <td className="border px-2 py-1">{item.size}</td>
                <td className="border px-2 py-1">{fx(item.rate)}</td>
                <td className="border px-2 py-1">{fx(item.d1_percent)}</td>
                <td className="border px-2 py-1">{fx(item.gst_percent)}</td>
                <td className="border px-2 py-1">{fx(finalAmt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-6 font-semibold text-lg">Total Amount: {fx(p.summary?.final || p.total_amount || 0)}</div>
    </div>
  );
}
