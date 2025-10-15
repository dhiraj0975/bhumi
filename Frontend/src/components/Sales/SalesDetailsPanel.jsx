// src/pages/sales/SalesDetailsPanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import salesAPI from "../../axios/salesAPI";
import { toast } from "react-toastify";

const fx2 = (n) => (isNaN(n) ? "0.00" : Number(n).toFixed(2));

export default function SalesDetailsPanel({ id, onClose }) {
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await salesAPI.getById(id); // backend returns sale with party fields + items
        setSale(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load sale details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const totals = useMemo(() => {
    if (!sale?.items) return { taxable: 0, gst: 0, net: 0 };
    return sale.items.reduce(
      (acc, r) => {
        acc.taxable += Number(r.taxable_amount || 0);
        acc.gst += Number(r.gst_amount || 0);
        acc.net += Number(r.net_total || 0);
        return acc;
      },
      { taxable: 0, gst: 0, net: 0 }
    );
  }, [sale]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 md:p-8"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-auto bg-white shadow-xl rounded-lg z-10 sale-details-print"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b no-print">
          <h3 className="text-lg font-semibold">Sale Details</h3>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 active:scale-95"
              onClick={() => window.print()}
              aria-label="Print"
              title="Print"
            >
              Print
            </button>
            <button
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 active:scale-95"
              onClick={onClose}
              aria-label="Close details"
            >
              Close
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading ? (
            <div>Loading...</div>
          ) : !sale ? (
            <div>Not found</div>
          ) : (
            <>
              {/* Header grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="text-gray-500">Bill No</div>
                  <div className="font-semibold">{sale.bill_no}</div>
                </div>
                <div>
                  <div className="text-gray-500">Date</div>
                  <div className="font-semibold">
                    {sale.bill_date || (sale.created_at ? new Date(sale.created_at).toLocaleDateString() : "-")}
                  </div>
                </div>
                {/* Party + badge */}
                <div>
                  <div className="text-gray-500">Party</div>
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{sale.party_name || sale.customer_name || "-"}</div>
                    {sale.party_type ? (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded ${
                          sale.party_type === "farmer"
                            ? "bg-emerald-100 text-emerald-700"
                            : sale.party_type === "vendor"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {sale.party_type}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Payment</div>
                  <div className="font-semibold">{sale.payment_status}</div>
                </div>
                <div>
                  <div className="text-gray-500">Method</div>
                  <div className="font-semibold">{sale.payment_method}</div>
                </div>
                <div>
                  <div className="text-gray-500">Status</div>
                  <div className="font-semibold">{sale.status}</div>
                </div>
                {/* Party GST / Balances */}
                <div>
                  <div className="text-gray-500">Party GST</div>
                  <div className="font-semibold">{sale.party_gst || "-"}</div>
                </div>
                {/* <div>
                  <div className="text-gray-500">Party Balance</div>
                  <div className="font-semibold">{fx2(sale.party_balance || 0)}</div>
                </div> */}
                {/* <div>
                  <div className="text-gray-500">Min Balance</div>
                  <div className="font-semibold">{fx2(sale.party_min_balance || 0)}</div>
                </div> */}
                <div className="md:col-span-3">
                  <div className="text-gray-500">Remarks</div>
                  <div className="font-semibold">{sale.remarks || "-"}</div>
                </div>
              </div>

              {/* Items */}
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
                      <th className="p-2 border">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(sale.items || []).map((r, i) => (
                      <tr key={r.id || i} className="odd:bg-white even:bg-gray-50 text-center">
                        <td className="p-2 border">{i + 1}</td>
                        <td className="p-2 border">{r.item_name}</td>
                        <td className="p-2 border">{r.hsn_code}</td>
                        <td className="p-2 border">{r.qty}</td>
                        <td className="p-2 border">{fx2(r.rate)}</td>
                        <td className="p-2 border">{fx2(r.discount_rate)}</td>
                        <td className="p-2 border">{fx2(r.gst_percent)}</td>
                        <td className="p-2 border">{fx2(r.taxable_amount)}</td>
                        <td className="p-2 border">{fx2(r.gst_amount)}</td>
                        <td className="p-2 border">{fx2(r.net_total)}</td>
                        <td className="p-2 border">{r.unit}</td>
                      </tr>
                    ))}
                    {!sale.items?.length && (
                      <tr>
                        <td className="p-4 text-center" colSpan={11}>
                          No items
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded">Taxable: {fx2(totals.taxable)}</div>
                <div className="p-3 bg-gray-50 rounded">GST Amt: {fx2(totals.gst)}</div>
                <div className="p-3 bg-gray-50 rounded">Total: {fx2(totals.net)}</div>
              </div>
            </>
          )}
        </div>

        {/* Print CSS */}
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .sale-details-print, .sale-details-print * { visibility: visible; }
            .sale-details-print { position: absolute; left: 0; top: 0; width: 100%; background: #fff; }
            .no-print { display: none !important; }
            @page { size: A4; margin: 12mm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          table { border-collapse: collapse; }
          th, td { border: 1px solid #e5e7eb; }
        `}</style>
      </div>
    </div>
  );
}
