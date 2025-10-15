// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchPurchaseOrderById } from  "../../redux/purchaseOrders/purchaseOrderSlice";
// import { useParams } from "react-router-dom";

// const PurchaseOrderDetails = () => {
//   const { id } = useParams(); // URL se PO id milegi
//   const dispatch = useDispatch();
// const { current, loading, error } = useSelector(
//   (state) => state.purchaseOrders
// );

//   useEffect(() => {
//     if (id) {
//       dispatch(fetchPurchaseOrderById(id));
//     }
//   }, [dispatch, id]);

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p className="text-red-500">{error}</p>;
// if (!current) return <p>No Purchase Order Found</p>;

//   return (
//     <div className="p-6 bg-white shadow-md rounded-2xl">
//       <h2 className="text-xl font-bold mb-4">Purchase Order Details</h2>

//       {/* ✅ PO Header Info */}
//       <div className="grid grid-cols-2 gap-4 mb-6">
//         <p className=""><strong>PO No:</strong> {current.po_no}</p>
//         <p><strong>Date:</strong> {current.date}</p>
//         <p><strong>Bill Date:</strong> {current.bill_time}</p>
//         <p><strong>Vendor ID:</strong> {current.vendor_id}</p>
//         <p><strong>Mobile:</strong> {current.mobile_no}</p>
//         <p><strong>GST No:</strong> {current.gst_no}</p>
//         <p><strong>Delivery Place:</strong> {current.place_of_delivery}</p>
//         <p><strong>Terms:</strong> {current.terms_and_conditions}</p>
//       </div>

//       {/* ✅ PO Items Table */}
//       <h3 className="text-lg font-semibold mb-2">Items</h3>
//       <table className="w-full border">
//         <thead>
//           <tr className="bg-gray-100">
//             <th className="border p-2">S.No</th>
//             <th className="border p-2">Item Name</th>
//             <th className="border p-2">HSN Code</th>
//             <th className="border p-2">Qty</th>
//             <th className="border p-2">Rate</th>
//             <th className="border p-2">Amount</th>
//             <th className="border p-2">Disc %</th>
//             <th className="border p-2">Disc Amt</th>
//           </tr>
//         </thead>
//         <tbody>
//           {current.items && current.items.length > 0 ? (
//             current.items.map((item, index) => (
//               <tr key={item.id}>
//                 <td className="border p-2 text-center">{index + 1}</td>
//                 <td className="border p-2">{item.item_name}</td>
//                 <td className="border p-2">{item.hsn_code}</td>
//                 <td className="border p-2 text-center">{item.qty}</td>
//                 <td className="border p-2 text-right">{item.rate}</td>
//                 <td className="border p-2 text-right">{item.amount}</td>
//                 <td className="border p-2 text-center">{item.discount_rate}%</td>
//                 <td className="border p-2 text-right">{item.discount_total}</td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="8" className="text-center p-4">
//                 No Items Found
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       {/* ✅ GST + Grand Total */}
//       <div className="mt-6">
//         <p><strong>GST %:</strong> {current.gst_percent}</p>
//         <p><strong>Total Amount:</strong> {current.total_amount}</p>
//       </div>
//     </div>
//   );
// };

// export default PurchaseOrderDetails;




import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPurchaseOrderById } from "../../features/purchaseOrders/purchaseOrderSlice";
import { useParams } from "react-router-dom";

const fx = (n) => (isNaN(n) ? "0.00" : Number(n).toFixed(2));

const PurchaseOrderDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current, loading, error } = useSelector((state) => state.purchaseOrders);

  useEffect(() => {
    if (id) dispatch(fetchPurchaseOrderById(id));
  }, [dispatch, id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!current) return <div>No Purchase Order Found</div>;

  return (
    <div>
      <h3>Purchase Order Details</h3>
      <p><strong>PO No:</strong> {current.po_no}</p>
      <p><strong>Date:</strong> {current.date}</p>
      <p><strong>Bill Time:</strong> {current.bill_time}</p>
      <p><strong>Vendor ID:</strong> {current.vendor_id}</p>
      <p><strong>Mobile:</strong> {current.mobile_no}</p>
      <p><strong>GST No:</strong> {current.gst_no}</p>
      <p><strong>Place of Supply:</strong> {current.place_of_supply}</p>
      <p><strong>Terms:</strong> {current.terms_condition}</p>

      <h4>Items</h4>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Item Name</th>
              <th>HSN</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>Disc%/Unit</th>
              <th>Disc Amt</th>
              <th>GST%</th>
              <th>GST Amt</th>
              <th>Final</th>
            </tr>
          </thead>
          <tbody>
            {current.items && current.items.length > 0 ? (
              current.items.map((item, index) => (
                <tr key={item.id || index}>
                  <td>{index + 1}</td>
                  <td>{item.item_name || item.product_name || item.product_id}</td>
                  <td>{item.hsn_code}</td>
                  <td>{fx(item.qty)}</td>
                  <td>{fx(item.rate)}</td>
                  <td>{fx(item.amount)}</td>
                  <td>{fx(item.discount_per_qty)}</td>
                  <td>{fx(item.discount_total)}</td>
                  <td>{fx(item.gst_percent)}</td>
                  <td>{fx(item.gst_amount)}</td>
                  <td>{fx(item.final_amount)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} style={{ textAlign: "center" }}>No Items Found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h4>Summary</h4>
      <p><strong>Taxable:</strong> {fx(current?.summary?.total_taxable || 0)}</p>
      <p><strong>GST:</strong> {fx(current?.summary?.total_gst || 0)}</p>
      <p><strong>Grand Total:</strong> {fx(current?.summary?.grand_total || 0)}</p>
    </div>
  );
};

export default PurchaseOrderDetails;
