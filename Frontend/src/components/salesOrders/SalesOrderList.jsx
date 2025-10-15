import React, { useEffect, useMemo, useState } from "react";
import { soApi, refApi } from "../../axios/soApi.js";

const fx = (n, d = 2) => (isNaN(n) ? (0).toFixed(d) : Number(n).toFixed(d));
const formatDate = (s) => (!s ? "-" : new Date(s).toISOString().split("T")[0]);
const formatTime = (s) => {
  if (!s) return "-";
  const d = new Date(s);
  if (isNaN(d)) return "-";
  let h = d.getHours(), m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM"; h = h % 12; if (h === 0) h = 12;
  return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
};

export default function SalesOrderList({ onEdit,refreshKey = 0  }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [show, setShow] = useState(false);

  const productNameOf = useMemo(() => {
    const map = new Map();
    (products || []).forEach((p) => map.set(String(p.id ?? p._id), p.product_name));
    return (id) => map.get(String(id));
  }, [products]);

  const load = async () => {
    try {
      setLoading(true);
      const [l, p] = await Promise.all([soApi.list(), refApi.products()]);
      setRows(l.data || []);
      setProducts(p.data?.list || p.data || []);
      setErr("");
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [refreshKey]);

  const openModal = (po) => { setSelected(po); setShow(true); };
  const closeModal = () => { setShow(false); setSelected(null); };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this SO?")) return;
    await soApi.remove(id);
    load();
  };

  if (loading) return <div className="p-6 bg-white shadow rounded">Loading...</div>;
  if (err) return <div className="p-6 bg-white shadow rounded text-red-600">{err}</div>;

  return (
    <div className="bg-white shadow rounded">
      <div className="flex items-center border-b border-gray-200 justify-between mb-3">
        <h3 className="text-lg font-semibold">Sales Orders</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">SO No</th>
              <th className="border p-2 text-left">Customer</th>
              <th className="border p-2 text-left">Date</th>
              <th className="border p-2 text-left">Bill Time</th>
              <th className="border p-2 text-right">Taxable</th>
              <th className="border p-2 text-right">GST</th>
              <th className="border p-2 text-right">Grand</th>
              <th className="border p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="border p-4 text-center" colSpan={8}>No Sales Orders</td>
              </tr>
            )}
            {rows.map((r) => {
              const id = r.id || r._id;
              return (
                <tr key={id} className="odd:bg-white even:bg-gray-50">
                  <td className="border p-2">
                    <button className="underline text-blue-600 hover:text-blue-800 active:scale-95" onClick={() => openModal(r)}>
                      {r.so_no || "-"}
                    </button>
                  </td>
                  <td className="border p-2">{r.customer_name || r.customer_id || "-"}</td>
                  <td className="border p-2">{formatDate(r.date)}</td>
                  <td className="border p-2">{formatTime(r.bill_time)}</td>
                  <td className="border p-2 text-right">{fx(r?.summary?.total_taxable ?? 0)}</td>
                  <td className="border p-2 text-right">{fx(r?.summary?.total_gst ?? 0)}</td>
                  <td className="border p-2 text-right font-semibold">{fx(r?.summary?.grand_total ?? r.final_amount ?? 0)}</td>
                  <td className="border p-2 space-x-2">
                    <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 active:scale-95" onClick={() => openModal(r)}>Items</button>
                    <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 active:scale-95" onClick={() => onEdit && onEdit(r)}>Edit</button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 active:scale-95" onClick={() => onDelete(id)}>Delete</button>
                    <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 active:scale-95" onClick={() => window.location.assign(`/sales-invoice/${id}`)}>Invoice</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {show && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative z-10 w-[95vw] max-w-5xl max-h-[90vh] overflow-auto bg-white rounded-xl shadow-xl">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h4 className="text-lg font-semibold">SO Details — {selected.so_no}</h4>
              <button className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 active:scale-95" onClick={closeModal}>Close</button>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div><div className="text-gray-500">Customer</div><div className="font-medium">{selected.customer_name || selected.customer_id || "-"}</div></div>
              <div><div className="text-gray-500">Date</div><div className="font-medium">{formatDate(selected.date)}</div></div>
              <div><div className="text-gray-500">Bill Time</div><div className="font-medium">{formatTime(selected.bill_time)}</div></div>
              <div className="sm:col-span-2"><div className="text-gray-500">Address</div><div className="font-medium">{selected.address || "-"}</div></div>
              <div><div className="text-gray-500">Mobile</div><div className="font-medium">{selected.mobile_no || "-"}</div></div>
              <div><div className="text-gray-500">GST</div><div className="font-medium">{selected.gst_no || "-"}</div></div>
              <div><div className="text-gray-500">Place</div><div className="font-medium">{selected.place_of_supply || "-"}</div></div>
              <div className="lg:col-span-3"><div className="text-gray-500">Terms</div><div className="font-medium">{selected.terms_condition || "-"}</div></div>
            </div>

            <div className="px-5 pb-5">
              <div className="text-sm font-semibold mb-2">Items</div>
              <div className="overflow-auto">
                <table className="w-full border text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-1">#</th>
                      <th className="border p-1 text-left">Product</th>
                      <th className="border p-1 text-left">HSN</th>
                      <th className="border p-1 text-right">Qty</th>
                      <th className="border p-1 text-right">Rate</th>
                      <th className="border p-1 text-right">Amount</th>
                      <th className="border p-1 text-right">Disc%/Unit</th>
                      <th className="border p-1 text-right">Disc Amt</th>
                      <th className="border p-1 text-right">GST%</th>
                      <th className="border p-1 text-right">GST Amt</th>
                      <th className="border p-1 text-right">Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.items || []).map((it, idx) => {
                      const name = it.product_name || it.item_name || productNameOf(it.product_id) || String(it.product_id);
                      return (
                        <tr key={it.id || idx} className="odd:bg-white even:bg-gray-50">
                          <td className="border p-1">{idx + 1}</td>
                          <td className="border p-1">{name}</td>
                          <td className="border p-1">{it.hsn_code || "-"}</td>
                          <td className="border p-1 text-right">{fx(it.qty, 2)}</td>
                          <td className="border p-1 text-right">{fx(it.rate, 2)}</td>
                          <td className="border p-1 text-right">{fx(it.amount, 2)}</td>
                          <td className="border p-1 text-right">{fx(it.discount_per_qty ?? 0, 2)} ({fx(it.discount_rate ?? 0, 2)})</td>
                          <td className="border p-1 text-right">{fx(it.discount_total ?? 0, 2)}</td>
                          <td className="border p-1 text-right">{fx(it.gst_percent ?? 0, 2)}</td>
                          <td className="border p-1 text-right">{fx(it.gst_amount ?? 0, 2)}</td>
                          <td className="border p-1 text-right">{fx(it.final_amount ?? it.total ?? 0, 2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end text-sm">
                <div>
                  <div>Taxable: <span className="font-medium">{fx(selected?.summary?.total_taxable ?? 0)}</span></div>
                  <div>GST: <span className="font-medium">{fx(selected?.summary?.total_gst ?? 0)}</span></div>
                  <div className="font-semibold text-base">Grand Total: {fx(selected?.summary?.grand_total ?? selected?.final_amount ?? 0)}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
