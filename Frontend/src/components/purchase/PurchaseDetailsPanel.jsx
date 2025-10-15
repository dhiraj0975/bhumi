import React, { useEffect, useMemo, useState } from "react";
import PurchaseAPI from "../../axios/purchaseApi";
import { toast } from "react-toastify";

const fx = (n) => (isNaN(n) ? "0.000" : Number(n).toFixed(3));

export default function PurchaseDetailsPanel({ id, onClose }) {
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await PurchaseAPI.getById(id);
        setPurchase(res.data || null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load purchase details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const totals = useMemo(() => {
    if (!purchase?.items) return { taxable: 0, gst: 0, net: 0 };
    return purchase.items.reduce(
      (acc, it) => {
        const base = (Number(it.size || 0) * Number(it.rate || 0)) || 0;
        const disc = (base * (Number(it.d1_percent || it.discount_rate || 0))) / 100;
        const taxable = base - disc;
        const gstAmt = (taxable * (Number(it.gst_percent || 0))) / 100;
        const finalAmt = taxable + gstAmt;
        acc.taxable += taxable;
        acc.gst += gstAmt;
        acc.net += finalAmt;
        return acc;
      },
      { taxable: 0, gst: 0, net: 0 }
    );
  }, [purchase]);

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 md:p-8" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-auto bg-white shadow-xl rounded-lg z-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Purchase Details</h3>
          <button className="px-3 py-1 bg-gray-200 rounded" onClick={onClose}>Close</button>
        </div>

        <div className="p-6">
          {loading ? (
            <div>Loading...</div>
          ) : !purchase ? (
            <div>Not found</div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="text-gray-500">Bill No</div>
                  <div className="font-semibold">{purchase.bill_no}</div>
                </div>
                <div>
                  <div className="text-gray-500">Date</div>
                  <div className="font-semibold">{purchase.bill_date}</div>
                </div>
                {/* Party name + badge */}
                <div>
                  <div className="text-gray-500">Party</div>
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">
                      {purchase.party_name || purchase.vendor_name || "-"}
                    </div>
                    {purchase.party_type ? (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded ${
                          purchase.party_type === "farmer"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {purchase.party_type}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">GST No</div>
                  <div className="font-semibold">{purchase.gst_no || "-"}</div>
                </div>
                <div>
                  <div className="text-gray-500">Status</div>
                  <div className="font-semibold">{purchase.status || "-"}</div>
                </div>
                <div className="md:col-span-3">
                  <div className="text-gray-500">Remarks</div>
                  <div className="font-semibold">{purchase.remarks || "-"}</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border">SI</th>
                      <th className="p-2 border">Item Name</th>
                      <th className="p-2 border">HSN</th>
                      <th className="p-2 border">Qty</th>
                      <th className="p-2 border">Rate</th>
                      <th className="p-2 border">Disc %</th>
                      <th className="p-2 border">GST %</th>
                      <th className="p-2 border">Taxable</th>
                      <th className="p-2 border">GST Amt</th>
                      <th className="p-2 border">Final Amt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(purchase.items || []).map((it, i) => {
                      const base = (Number(it.size || 0) * Number(it.rate || 0)) || 0;
                      const discPct = Number(it.d1_percent || it.discount_rate || 0);
                      const discAmt = (base * discPct) / 100;
                      const taxable = base - discAmt;
                      const gstAmt = (taxable * Number(it.gst_percent || 0)) / 100;
                      const finalAmt = taxable + gstAmt;
                      return (
                        <tr key={it.id || i} className="odd:bg-white even:bg-gray-50 text-center">
                          <td className="p-2 border">{i + 1}</td>
                          <td className="p-2 border">{it.item_name || it.product_name}</td>
                          <td className="p-2 border">{it.hsn_code || ""}</td>
                          <td className="p-2 border">{it.size}</td>
                          <td className="p-2 border">{fx(it.rate)}</td>
                          <td className="p-2 border">{fx(discPct)}</td>
                          <td className="p-2 border">{fx(it.gst_percent)}</td>
                          <td className="p-2 border">{fx(taxable)}</td>
                          <td className="p-2 border">{fx(gstAmt)}</td>
                          <td className="p-2 border">{fx(finalAmt)}</td>
                        </tr>
                      );
                    })}
                    {!purchase.items?.length && (
                      <tr>
                        <td className="p-4 text-center" colSpan={10}>No items</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded">Taxable: {fx(totals.taxable)}</div>
                <div className="p-3 bg-gray-50 rounded">GST Amt: {fx(totals.gst)}</div>
                <div className="p-3 bg-gray-50 rounded">Total: {fx(totals.net)}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
