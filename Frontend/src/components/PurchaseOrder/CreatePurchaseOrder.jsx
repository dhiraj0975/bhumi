// import React, { useEffect, useMemo, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchVendors } from "../../features/vendor/vendorThunks";
// import { fetchProducts } from "../../features/products/productsSlice";
// import { createPurchaseOrder, fetchPurchaseOrders, updatePurchaseOrder } from "../../features/purchaseOrders/purchaseOrderSlice";

// const fx = (n, d = 2) => (isNaN(n) ? (0).toFixed(d) : Number(n).toFixed(d));

// const calcLine = (r) => {
//   const qty = Number(r.qty) || 0;
//   const rate = Number(r.rate) || 0;
//   const d1 = Number(r.d1_percent) || 0;
//   const gst = Number(r.gst_percent) || 0;

//   const amount = qty * rate;
//   const discPerUnit = (rate * d1) / 100;
//   const discTotal = discPerUnit * qty;
//   const taxable = Math.max(amount - discTotal, 0);
//   const gstAmt = (taxable * gst) / 100;
//   const finalAmt = taxable + gstAmt;

//   return { amount, discPerUnit, discTotal, taxable, gstAmt, finalAmt };
// };

// export default function CreatePurchaseOrder({ purchaseOrder = null, onSubmitted }) {
//   const dispatch = useDispatch();

//   const { vendors = [] } = useSelector((s) => s.vendors || { vendors: [] });
//   const { list: products = [] } = useSelector((s) => s.products || { list: [] });
//   const { loading } = useSelector((s) => s.purchaseOrders || { loading: false });

//   const isEditMode = Boolean(purchaseOrder);

//   const [formData, setFormData] = useState({
//     po_no: "",
//     vendor_id: "",
//     date: "",
//     bill_time: "",
//     bill_time_am_pm: "PM",
//     address: "",
//     mobile_no: "",
//     gst_no: "",
//     place_of_supply: "",
//     terms_condition: "",
//     items: [{ product_id: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0 }],
//   });

//   // init
//   useEffect(() => {
//     dispatch(fetchVendors());
//     dispatch(fetchProducts());
//     dispatch(fetchPurchaseOrders());
//   }, [dispatch]);

//   // edit mode sync
//   useEffect(() => {
//     if (isEditMode && purchaseOrder) {
//       const normalizedDate = purchaseOrder.date ? new Date(purchaseOrder.date).toISOString().split("T")[0] : "";
//       setFormData((p) => ({
//         ...p,
//         po_no: purchaseOrder.po_no || "",
//         vendor_id: String(purchaseOrder.vendor_id || ""),
//         date: normalizedDate,
//         bill_time: "",
//         bill_time_am_pm: "PM",
//         address: purchaseOrder.address || "",
//         mobile_no: purchaseOrder.mobile_no || "",
//         gst_no: purchaseOrder.gst_no || "",
//         place_of_supply: purchaseOrder.place_of_supply || "",
//         terms_condition: purchaseOrder.terms_condition || "",
//         items:
//           purchaseOrder.items?.map((it) => ({
//             product_id: String(it.product_id || ""),
//             hsn_code: it.hsn_code || "",
//             qty: Number(it.qty || 0),
//             rate: Number(it.rate || 0),
//             d1_percent: Number(it.discount_per_qty ?? 0),
//             gst_percent: Number(it.gst_percent || 0),
//           })) || [{ product_id: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0 }],
//       }));
//     }
//   }, [isEditMode, purchaseOrder]);

//   // header change
//   const changeHeader = (e) => {
//     const { name, value } = e.target;
//     if (name === "vendor_id") {
//       const idNum = parseInt(value || "0", 10);
//       const v = vendors.find((x) => String(x.id ?? x._id) === String(idNum));
//       if (v) {
//         setFormData((p) => ({
//           ...p,
//           vendor_id: String(idNum),
//           address: v.address || "",
//           mobile_no: v.contact_number || v.mobile_no || "",
//           gst_no: v.gst_no || "",
//         }));
//         return;
//       }
//     }
//     setFormData((p) => ({ ...p, [name]: value }));
//   };

//   // item change
//   const changeItem = (i, e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => {
//       const next = { ...prev };
//       const row = { ...next.items[i] };
//       const numeric = ["qty", "rate", "d1_percent", "gst_percent", "product_id"];
//       row[name] = numeric.includes(name) ? (value === "" ? 0 : Number(value)) : value;

//       if (name === "product_id") {
//         const p = products.find((x) => String(x.id ?? x._id) === String(value));
//         row.hsn_code = p?.hsn_code || "";
//         if (!row.rate && p?.purchase_rate) row.rate = Number(p.purchase_rate);
//       }

//       next.items = next.items.map((it, idx) => (idx === i ? row : it));
//       return next;
//     });
//   };

//   const addItem = () =>
//     setFormData((p) => ({
//       ...p,
//       items: [...p.items, { product_id: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0 }],
//     }));

//   const removeItem = (i) =>
//     setFormData((p) => ({
//       ...p,
//       items: p.items.filter((_, idx) => idx !== i),
//     }));

//   const totals = useMemo(() => {
//     return formData.items.reduce(
//       (a, r) => {
//         const c = calcLine(r);
//         a.taxable += c.taxable;
//         a.gst += c.gstAmt;
//         a.final += c.finalAmt;
//         return a;
//       },
//       { taxable: 0, gst: 0, final: 0 }
//     );
//   }, [formData.items]);

//   const isValid = useMemo(() => {
//     const headOk = formData.po_no && Number(formData.vendor_id) > 0;
//     const itemsOk =
//       formData.items.length > 0 &&
//       formData.items.every((r) => Number(r.product_id) > 0 && Number(r.qty) > 0 && Number(r.rate) > 0);
//     return Boolean(headOk && itemsOk);
//   }, [formData]);

//   const submit = async (e) => {
//     e.preventDefault();
//     try {
//       // 12-hour -> 24-hour merge
//       let [h = "00", m = "00"] = String(formData.bill_time || "00:00").split(":");
//       let hour = Number(h);
//       let minute = Number(m);
//       if (isNaN(hour)) hour = 0;
//       if (isNaN(minute)) minute = 0;
//       if (formData.bill_time_am_pm === "PM" && hour < 12) hour += 12;
//       if (formData.bill_time_am_pm === "AM" && hour === 12) hour = 0;

//       const bill_time = formData.date
//         ? `${formData.date} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`
//         : null;

//       // Respect generated columns: only core fields per item
//       const items = formData.items.map((r) => ({
//         product_id: Number(r.product_id),
//         hsn_code: r.hsn_code || "",
//         qty: Number(r.qty),
//         rate: Number(r.rate),
//         discount_per_qty: Number(r.d1_percent || 0),
//         gst_percent: Number(r.gst_percent || 0),
//       }));

//       const payload = {
//         po_no: formData.po_no,
//         vendor_id: Number(formData.vendor_id),
//         date: formData.date || null,
//         bill_time,
//         address: formData.address || "",
//         mobile_no: formData.mobile_no || "",
//         gst_no: formData.gst_no || "",
//         place_of_supply: formData.place_of_supply || "",
//         terms_condition: formData.terms_condition || "",
//         items,
//       };

//       const action = isEditMode
//         ? updatePurchaseOrder({ id: purchaseOrder.id || purchaseOrder._id, data: payload })
//         : createPurchaseOrder(payload);

//       const result = await dispatch(action);
//       if (result?.error?.message?.includes("ER_DUP_ENTRY") || result?.payload?.error?.includes("PO number already exists")) {
//         alert("PO number already exists. Please use a unique PO No.");
//         return;
//       }

//       if (!result.error) {
//         if (onSubmitted) onSubmitted();
//         dispatch(fetchPurchaseOrders());
//         if (!isEditMode) {
//           setFormData((p) => ({
//             ...p,
//             po_no: "",
//             vendor_id: "",
//             date: "",
//             bill_time: "",
//             address: "",
//             mobile_no: "",
//             gst_no: "",
//             place_of_supply: "",
//             terms_condition: "",
//             items: [{ product_id: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0 }],
//           }));
//         }
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Failed to save PO.");
//     }
//   };

//   return (
//     <form onSubmit={submit} className="space-y-4">
//       <h3 className="text-xl font-semibold">{isEditMode ? "Edit PO" : "Create PO"}</h3>

//       {/* Header grid: 4 per row */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
//         <div className="flex flex-col">
//           <label className="text-xs text-gray-600">PO No</label>
//           <input className="border rounded p-2" name="po_no" value={formData.po_no} onChange={changeHeader} required />
//         </div>

//         <div className="flex flex-col">
//           <label className="text-xs text-gray-600">Vendor</label>
//           <select className="border rounded p-2" name="vendor_id" value={formData.vendor_id} onChange={changeHeader} required>
//             <option value="">Select vendor</option>
//             {vendors.map((v) => (
//               <option key={v.id || v._id} value={v.id || v._id}>
//                 {v.firm_name || v.vendor_name || v.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="flex flex-col">
//           <label className="text-xs text-gray-600">Dateeee</label>
//           <input type="date" className="border rounded p-2" name="date" value={formData.date} onChange={changeHeader} />
//         </div>

//         <div className="flex flex-col">
//           <label className="text-xs text-gray-600">Bill Time</label>
//           <div className="flex gap-2">
//             <input type="time" className="border rounded p-2 w-full" name="bill_time" value={formData.bill_time} onChange={changeHeader} />
//             <select name="bill_time_am_pm" className="border rounded p-2" value={formData.bill_time_am_pm} onChange={changeHeader}>
//               <option>AM</option>
//               <option>PM</option>
//             </select>
//           </div>
//         </div>

//         <div className="flex flex-col lg:col-span-2">
//           <label className="text-xs text-gray-600">Address</label>
//           <input className="border rounded p-2" name="address" value={formData.address} onChange={changeHeader} />
//         </div>

//         <div className="flex flex-col">
//           <label className="text-xs text-gray-600">Mobile</label>
//           <input className="border rounded p-2" name="mobile_no" value={formData.mobile_no} onChange={changeHeader} />
//         </div>

//         <div className="flex flex-col">
//           <label className="text-xs text-gray-600">GST No</label>
//           <input className="border rounded p-2" name="gst_no" value={formData.gst_no} onChange={changeHeader} />
//         </div>

//         <div className="flex flex-col">
//           <label className="text-xs text-gray-600">Place of Supply</label>
//           <input className="border rounded p-2" name="place_of_supply" value={formData.place_of_supply} onChange={changeHeader} />
//         </div>

//         <div className="flex flex-col lg:col-span-3">
//           <label className="text-xs text-gray-600">Terms</label>
//           <input className="border rounded p-2" name="terms_condition" value={formData.terms_condition} onChange={changeHeader} />
//         </div>
//       </div>

//       {/* Items */}
//       <div className="mt-2">
//         <div className="text-sm font-semibold mb-2">Items</div>

//         {formData.items.map((it, i) => {
//           const c = calcLine(it);
//           return (
//             <div key={i} className="mb-3 border rounded p-2">
//               {/* Row-1: 4 inputs */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
//                 <select
//                   className="border rounded p-2"
//                   name="product_id"
//                   value={it.product_id}
//                   onChange={(e) => changeItem(i, e)}
//                 >
//                   <option value="">Select product</option>
//                   {products.map((p) => (
//                     <option key={p.id || p._id} value={p.id || p._id}>
//                       {p.product_name}
//                     </option>
//                   ))}
//                 </select>

//                 <input
//                   className="border rounded p-2"
//                   name="hsn_code"
//                   placeholder="HSN"
//                   value={it.hsn_code || ""}
//                   onChange={(e) => changeItem(i, e)}
//                 />

//                 <input
//                   className="border rounded p-2"
//                   name="qty"
//                   type="number"
//                   min={0}
//                   value={it.qty}
//                   onChange={(e) => changeItem(i, e)}
//                   placeholder="Qty"
//                 />

//                 <input
//                   className="border rounded p-2"
//                   name="rate"
//                   type="number"
//                   min={0}
//                   value={it.rate}
//                   onChange={(e) => changeItem(i, e)}
//                   placeholder="Rate"
//                 />
//               </div>

//               {/* Row-2: 4 controls */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2 items-center">
//                 <input
//                   className="border rounded p-2"
//                   name="d1_percent"
//                   type="number"
//                   min={0}
//                   value={it.d1_percent}
//                   onChange={(e) => changeItem(i, e)}
//                   placeholder="Disc%/Unit"
//                 />

//                 <input
//                   className="border rounded p-2"
//                   name="gst_percent"
//                   type="number"
//                   min={0}
//                   value={it.gst_percent}
//                   onChange={(e) => changeItem(i, e)}
//                   placeholder="GST%"
//                 />

//                 <div className="text-right lg:col-span-1 sm:col-span-2">
//                   <span className="text-xs text-gray-600 mr-2">Final:</span>
//                   <span className="font-semibold">{fx(c.finalAmt)}</span>
//                 </div>

//                 <div className="text-right">
//                   <button
//                     type="button"
//                     className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 active:scale-95"
//                     onClick={() => removeItem(i)}
//                   >
//                     Remove
//                   </button>
//                 </div>
//               </div>
//             </div>
//           );
//         })}

//         <button
//           type="button"
//           onClick={addItem}
//           className="mt-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 active:scale-95"
//         >
//           + Add Item
//         </button>
//       </div>

//       {/* Totals */}
//       <div className="flex justify-end">
//         <div className="text-right">
//           <div>Taxable: <span className="font-medium">{fx(totals.taxable)}</span></div>
//           <div>GST: <span className="font-medium">{fx(totals.gst)}</span></div>
//           <div className="font-semibold text-lg">Grand Total: {fx(totals.final)}</div>
//         </div>
//       </div>

//       {/* Submit */}
//       <div className="pt-1">
//         <button
//           type="submit"
//           disabled={!isValid || loading}
//           className={`px-6 py-2 rounded text-white ${
//             !isValid || loading ? "bg-green-700/50 cursor-not-allowed" : "bg-green-700 hover:bg-green-800 active:scale-95"
//           }`}
//         >
//           {isEditMode ? "Update" : "Create"}
//         </button>
//       </div>
//     </form>
//   );
// }
