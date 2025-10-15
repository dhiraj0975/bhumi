import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPurchaseOrders, deletePurchaseOrder } from "../../features/purchaseOrders/purchaseOrderSlice";
import { fetchProducts } from "../../features/products/productsSlice";
import { useNavigate } from "react-router-dom";


const fx = (n, d = 2) => (isNaN(n) ? (0).toFixed(d) : Number(n).toFixed(d));


const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d)) return "-";
  return d.toISOString().split("T")[0];
};


const formatBillTime = (billTime) => {
  if (!billTime) return "-";
  const d = new Date(billTime);
  if (isNaN(d)) return "-";
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
};


const PurchaseOrderList = ({ onEdit }) => {
  const dispatch = useDispatch();
  const { list = [], loading, error } = useSelector((s) => s.purchaseOrders);
  const { list: products = [] } = useSelector((s) => s.products || { list: [] });


  const [selectedPO, setSelectedPO] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    dispatch(fetchPurchaseOrders());
    dispatch(fetchProducts());
  }, [dispatch]);


  // product name resolver for modal table
  const productNameOf = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(String(p.id ?? p._id), p.product_name));
    return (id) => map.get(String(id));
  }, [products]);


  const openModal = (po) => {
    setSelectedPO(po);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedPO(null);
  };


  // close on ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && isModalOpen && closeModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen]);


  if (loading) {
    return <div className="p-6 bg-white shadow rounded text-sm">Loading...</div>;
  }
  if (error) {
    return <div className="p-6 bg-white shadow rounded text-sm text-red-600">{error}</div>;
  }


  return (
    <div className="p-6 bg-white shadow rounded">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">All POs</h3>
      </div>


      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">PO No</th>
              <th className="border p-2 text-left">Vendor</th>
              <th className="border p-2 text-left">Address</th>
              <th className="border p-2 text-left">Mobile</th>
              <th className="border p-2 text-left">Date</th>
              <th className="border p-2 text-left">Bill Time</th>
              <th className="border p-2 text-left">GST No</th>
              <th className="border p-2 text-left">Place of Supply</th>
              <th className="border p-2 text-left">Terms</th>
              <th className="border p-2 text-right">TAX Total</th>
              <th className="border p-2 text-right">GST Total</th>
              <th className="border p-2 text-right">Final Total</th>
              <th className="border p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {(!list || list.length === 0) && (
              <tr>
                <td className="border p-4 text-center" colSpan={13}>
                  No Purchase Orders Found
                </td>
              </tr>
            )}


            {list.map((po) => {
              const poId = po.id || po._id;
              const dateStr = formatDate(po.date);
              const billTimeStr = formatBillTime(po.bill_time);


              return (
                <tr key={poId} className="odd:bg-white even:bg-gray-50">
                  <td className="border p-2">
                    <button
                      className="underline text-blue-600 hover:text-blue-800 active:scale-95"
                      onClick={() => openModal(po)}
                      title="View details"
                    >
                      {po.po_no || "-"}
                    </button>
                  </td>
                  <td className="border p-2">{po.vendor_name || po.vendor_id || "-"}</td>
                  <td className="border p-2">{po.address || "-"}</td>
                  <td className="border p-2">{po.mobile_no || "-"}</td>
                  <td className="border p-2">{dateStr}</td>
                  <td className="border p-2">{billTimeStr}</td>
                  <td className="border p-2">{po.gst_no || "-"}</td>
                  <td className="border p-2">{po.place_of_supply || "-"}</td>
                  <td className="border p-2 truncate max-w-[220px]" title={po.terms_condition || ""}>
                    {po.terms_condition || "-"}
                  </td>
                  <td className="border p-2 text-right">{fx(po?.summary?.total_taxable ?? po.total_taxable ?? 0)}</td>
                  <td className="border p-2 text-right">{fx(po?.summary?.total_gst ?? po.total_gst ?? 0)}</td>
                  <td className="border p-2 text-right font-semibold">{fx(po?.summary?.grand_total ?? po.final_amount ?? 0)}</td>
<td className="border p-2">
  <div className="flex items-center gap-2">
    {/* Items (View) */}
    <button
      className="p-2 rounded hover:bg-gray-100 cursor-pointer active:scale-95"
      onClick={() => openModal(po)}
      title="View items"
      aria-label="View items"
    >
      {/* Eye icon */}
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeWidth="1.8" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" strokeWidth="1.8" />
      </svg>
    </button>


    {/* Edit */}
    <button
      className="p-2 rounded hover:bg-yellow-50 cursor-pointer active:scale-95"
      onClick={() => onEdit && onEdit(po)}
      title="Edit"
      aria-label="Edit"
    >
      {/* Pencil icon */}
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeWidth="1.8" d="M12 20h9" />
        <path strokeWidth="1.8" d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
    </button>


    {/* Delete */}
    <button
      className="p-2 rounded hover:bg-red-50 cursor-pointer active:scale-95"
      onClick={() => {
        if (window.confirm("Delete this PO?")) {
          dispatch(deletePurchaseOrder(poId)).then(() => dispatch(fetchPurchaseOrders()));
        }
      }}
      title="Delete"
      aria-label="Delete"
    >
      {/* Trash icon */}
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeWidth="1.8" d="M3 6h18" />
        <path strokeWidth="1.8" d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path strokeWidth="1.8" d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path strokeWidth="1.8" d="M10 11v6M14 11v6" />
      </svg>
    </button>




    <button
      className="btn cursor-pointer  btn-primary"
  onClick={() => navigate(`/purchases/create?poId=${po.id}`)}
>
   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeWidth="1.8" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path strokeWidth="1.8" d="M14 2v6h6" />
        <path strokeWidth="1.8" d="M8 13h8M8 17h5M8 9h3" />
      </svg>
</button>
  </div>
</td>


                </tr>
              );
            })}
          </tbody>
        </table>
      </div>


      {/* Modal */}
      {isModalOpen && selectedPO && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
          />
          {/* Card */}
          <div className="relative z-10 w-[95vw] max-w-5xl max-h-[90vh] overflow-auto bg-white rounded-xl shadow-xl">
<div className="flex items-center justify-between px-5 py-3 border-b">
  <h4 className="text-lg font-semibold">
    PO Details — {selectedPO.po_no || selectedPO.id}
  </h4>
  <div className="flex items-center gap-2 no-print">
    <button
      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 active:scale-95"
      onClick={() => window.print()}
    >
      Print
    </button>
    <button
      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 active:scale-95"
      onClick={closeModal}
      aria-label="Close"
    >
      Close
    </button>
  </div>
</div>



            {/* Header grid */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Vendor</div>
                <div className="font-medium">{selectedPO.vendor_name || selectedPO.vendor_id || "-"}</div>
              </div>
              <div>
                <div className="text-gray-500">Date</div>
                <div className="font-medium">{formatDate(selectedPO.date)}</div>
              </div>
              <div>
                <div className="text-gray-500">Bill Time</div>
                <div className="font-medium">{formatBillTime(selectedPO.bill_time)}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-gray-500">Address</div>
                <div className="font-medium">{selectedPO.address || "-"}</div>
              </div>
              <div>
                <div className="text-gray-500">Mobile</div>
                <div className="font-medium">{selectedPO.mobile_no || "-"}</div>
              </div>
              <div>
                <div className="text-gray-500">GST No</div>
                <div className="font-medium">{selectedPO.gst_no || "-"}</div>
              </div>
              <div>
                <div className="text-gray-500">Place of Supply</div>
                <div className="font-medium">{selectedPO.place_of_supply || "-"}</div>
              </div>
              <div className="lg:col-span-3">
                <div className="text-gray-500">Terms</div>
                <div className="font-medium">{selectedPO.terms_condition || "-"}</div>
              </div>
            </div>


            {/* Items table */}
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
                    {selectedPO.items && selectedPO.items.length > 0 ? (
                      selectedPO.items.map((it, idx) => {
                        const name =
                          it.product_name ||
                          it.item_name ||
                          productNameOf(it.product_id) ||
                          String(it.product_id);
                        return (
                          <tr key={it.id || idx} className="odd:bg-white even:bg-gray-50">
                            <td className="border p-1">{idx + 1}</td>
                            <td className="border p-1">{name}</td>
                            <td className="border p-1">{it.hsn_code || "-"}</td>
                            <td className="border p-1 text-right">{fx(it.qty, 2)}</td>
                            <td className="border p-1 text-right">{fx(it.rate, 2)}</td>
                            <td className="border p-1 text-right">{fx(it.amount, 2)}</td>
                            <td className="border p-1 text-right">
                              {fx(it.discount_per_qty ?? 0, 2)}{" "}
                              <span className="text-gray-500">({fx(it.discount_rate ?? 0, 2)})</span>
                            </td>
                            <td className="border p-1 text-right">{fx(it.discount_total ?? 0, 2)}</td>
                            <td className="border p-1 text-right">{fx(it.gst_percent ?? 0, 2)}</td>
                            <td className="border p-1 text-right">{fx(it.gst_amount ?? 0, 2)}</td>
                            <td className="border p-1 text-right">{fx(it.final_amount ?? it.total ?? 0, 2)}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td className="border p-2 text-center" colSpan={11}>
                          No Items Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>


              {/* Summary */}
              <div className="mt-4 flex justify-end">
                <div className="text-sm">
                  <div>Taxable: <span className="font-medium">{fx(selectedPO?.summary?.total_taxable ?? 0)}</span></div>
                  <div>GST: <span className="font-medium">{fx(selectedPO?.summary?.total_gst ?? 0)}</span></div>
                  <div className="font-semibold text-base">Grand Total: {fx(selectedPO?.summary?.grand_total ?? selectedPO?.final_amount ?? 0)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default PurchaseOrderList; 