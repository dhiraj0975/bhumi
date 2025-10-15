// src/pages/purchaseOrders/PurchaseOrderForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchVendors } from "../../features/vendor/vendorThunks";
import { fetchProducts } from "../../features/products/productsSlice";
import {
  fetchPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
} from "../../features/purchaseOrders/purchaseOrderSlice";
// If farmers Redux slice exists:
import { fetchFarmers } from "../../features/farmers/farmerSlice";
import Swal from "sweetalert2";

const fx = (n, d = 2) => (isNaN(n) ? "0.00" : Number(n).toFixed(d));

const PurchaseOrderForm = ({ purchaseOrder, onSubmitted }) => {
  const dispatch = useDispatch();

  const { loading } = useSelector((s) => s.purchaseOrders || { loading: false });
  const { vendors = [] } = useSelector((s) => s.vendors || { vendors: [] });
  // const farmers = useSelector((s) => s.farmers?.list || []);
  const { list: products = [] } = useSelector((s) => s.products || { list: [] });
  // Try to read farmers slice if available; otherwise this becomes []
  const farmers = useSelector((s) => s.farmers?.list || s.farmers || []);

  const isEditMode = Boolean(purchaseOrder);

  // Products normalization: available=size, rate=purchase_rate, gst from gst/gst_percent
  const normalizedProducts = useMemo(
    () =>
      (products || []).map((p) => ({
        id: p.id ?? p._id,
        product_name: p.product_name || "",
        hsn_code: p.hsn_code || "",
        purchase_rate: Number(p.purchase_rate || 0),
        gst_percent: Number(p.gst ?? p.gst_percent ?? 0),
        available: Number(p.size ?? p.available ?? p.stock ?? 0),
      })),
    [products]
  );

  const emptyHeader = {
    date: "",
    bill_time: "00:00",
    bill_time_am_pm: "PM",
    po_no: "",
    party_type: "vendor",
    vendor_id: "",
    farmer_id: "",
    address: "",
    mobile_no: "",
    gst_no: "",
    place_of_supply: "",
    terms_condition: "",
    party_balance: 0,
    party_min_balance: 0,
  };
  const emptyRow = { product_id: "", item_name: "", hsn_code: "", available: 0, qty: 1, rate: 0, d1_percent: 0, gst_percent: 0 };

  // Header styled like PurchaseForm + PO fields
  const [header, setHeader] = useState({
    date: "",
    bill_time: "00:00",
    bill_time_am_pm: "PM",
    po_no: "",
    party_type: "vendor",
    vendor_id: "",
    farmer_id: "",
    address: "",
    mobile_no: "",
    gst_no: "",
    place_of_supply: "",
    terms_condition: "",
    party_balance: 0,
    party_min_balance: 0,
  });

  const [rows, setRows] = useState([
    { product_id: "", item_name: "", hsn_code: "", available: 0, qty: 1, rate: 0, d1_percent: 0, gst_percent: 0 },
  ]);

  // Load masters + default date/time
  useEffect(() => {
    dispatch(fetchPurchaseOrders());
    dispatch(fetchVendors());
    dispatch(fetchProducts());
    dispatch(fetchFarmers()); // ensure this runs
    // dispatch(fetchFarmers()); // uncomment if you have farmers thunk

    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const hours = now.getHours();
    let displayH = hours % 12;
    if (displayH === 0) displayH = 12;

    setHeader((prev) => ({
      ...prev,
      date: `${y}-${m}-${d}`,
      bill_time: `${String(displayH).padStart(2, "0")}:${minutes}`,
    }));
  }, [dispatch]);

  // Hydrate edit
  useEffect(() => {
    if (!isEditMode || !purchaseOrder) return;

    const normalizedDate = purchaseOrder.date ? new Date(purchaseOrder.date).toISOString().split("T")[0] : "";
    setHeader((prev) => ({
      ...prev,
      po_no: purchaseOrder.po_no || "",
      date: normalizedDate || prev.date,
      bill_time: purchaseOrder.bill_time ? String(purchaseOrder.bill_time).slice(11, 16) : prev.bill_time,
      bill_time_am_pm: "PM",
      party_type: purchaseOrder.party_type || "vendor",
      vendor_id: purchaseOrder.vendor_id || "",
      farmer_id: purchaseOrder.farmer_id || "",
      address: purchaseOrder.address || "",
      mobile_no: purchaseOrder.mobile_no || "",
      gst_no: purchaseOrder.gst_no || "",
      place_of_supply: purchaseOrder.place_of_supply || "",
      terms_condition: purchaseOrder.terms_condition || "",
      party_balance: Number(purchaseOrder.party_balance ?? purchaseOrder.balance ?? 0),
      party_min_balance: Number(purchaseOrder.party_min_balance ?? purchaseOrder.min_balance ?? 0),
    }));

    setRows(
      (purchaseOrder.items || []).map((r) => {
        const np = normalizedProducts.find((p) => String(p.id) === String(r.product_id));
        return {
          product_id: String(r.product_id ?? ""),
          item_name: r.product_name || r.item_name || np?.product_name || "",
          hsn_code: r.hsn_code || np?.hsn_code || "",
          available: Number(np?.available ?? 0),
          qty: Number(r.qty || 1),
          rate: Number(r.rate ?? np?.purchase_rate ?? 0),
          d1_percent: Number(r.d1_percent ?? r.discount_rate ?? 0),
          gst_percent: Number(r.gst_percent ?? np?.gst_percent ?? 0),
        };
      })
    );
  }, [isEditMode, purchaseOrder, normalizedProducts]);

  const onHeader = (e) => setHeader((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onPartyTypeChange = (e) => {
    const val = e.target.value;
    setHeader((prev) => ({
      ...prev,
      party_type: val,
      vendor_id: val === "vendor" ? prev.vendor_id : "",
      farmer_id: val === "farmer" ? prev.farmer_id : "",
      address: "",
      mobile_no: "",
      gst_no: "",
      party_balance: 0,
      party_min_balance: 0,
    }));
  };

  const onPartyChange = (e) => {
    const id = e.target.value;

    if (header.party_type === "vendor") {
      const v = vendors.find((x) => String(x.id ?? x._id) === String(id));
      setHeader((prev) => ({
        ...prev,
        vendor_id: id,
        farmer_id: "",
        address: v?.address || "",
        mobile_no: v?.contact_number || v?.mobile_no || "",
        gst_no: v?.gst_no || "",
        party_balance: Number(v?.balance ?? 0),
        party_min_balance: Number(v?.min_balance ?? 0),
      }));
    } else if (header.party_type === "farmer") {
      const list = Array.isArray(farmers) ? farmers : [];
      const f = list.find((x) => String(x.id ?? x._id) === String(id));
      setHeader((prev) => ({
        ...prev,
        farmer_id: id,
        vendor_id: "",
        address: "",
        mobile_no: f?.contact_number || "",
        gst_no: "",
        party_balance: Number(f?.balance ?? 0),
        party_min_balance: Number(f?.min_balance ?? 0),
      }));
    }
  };

  const onRow = (i, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      const numeric = ["qty", "rate", "d1_percent", "gst_percent"];
      const v = numeric.includes(field) ? Number(value || 0) : value;
      next[i] = { ...next[i], [field]: v };

      if (field === "product_id") {
        const p = normalizedProducts.find((x) => String(x.id) === String(value));
        // Overwrite everything driven by product
        next[i].item_name = p?.product_name || "";
        next[i].hsn_code = p?.hsn_code || "";
        next[i].available = Number(p?.available || 0);
        next[i].rate = Number(p?.purchase_rate || 0);
        next[i].gst_percent = Number(p?.gst_percent || 0);
        if (!Number(next[i].qty) || next[i].qty < 1) next[i].qty = 1;
        // Optionally reset discount on product change
        // next[i].d1_percent = 0;
      }

      if (field === "qty") {
        const qty = Number(v || 0);
        if (!Number.isFinite(qty) || qty < 1) next[i].qty = 1;
      }
      return next;
    });
  };

  const calc = (r) => {
    const base = (r.qty || 0) * (r.rate || 0);
    const perUnitDisc = ((r.rate || 0) * (r.d1_percent || 0)) / 100;
    const totalDisc = (r.qty || 0) * perUnitDisc;
    const taxable = Math.max(0, base - totalDisc);
    const gstAmt = (taxable * (r.gst_percent || 0)) / 100;
    const final = taxable + gstAmt;
    return { base, perUnitDisc, totalDisc, taxable, gstAmt, final };
  };

  const totals = useMemo(
    () =>
      rows.reduce(
        (a, r) => {
          const c = calc(r);
          a.base += c.base;
          a.disc += c.totalDisc;
          a.taxable += c.taxable;
          a.gst += c.gstAmt;
          a.final += c.final;
          return a;
        },
        { base: 0, disc: 0, taxable: 0, gst: 0, final: 0 }
      ),
    [rows]
  );

  const addRow = () =>
    setRows((p) => [
      ...p,
      { product_id: "", item_name: "", hsn_code: "", available: 0, qty: 1, rate: 0, d1_percent: 0, gst_percent: 0 },
    ]);

  const removeRow = (idx) => setRows((p) => p.filter((_, i) => i !== idx));

  const isFormValid =
    String(header.date || "").trim() !== "" &&
    ((header.party_type === "vendor" && String(header.vendor_id || "").trim() !== "") ||
      (header.party_type === "farmer" && String(header.farmer_id || "").trim() !== "")) &&
    rows.length > 0 &&
    rows.every(
      (r) =>
        String(r.product_id).trim() !== "" &&
        String(r.item_name || "").trim() !== "" &&
        Number(r.qty) > 0 &&
        Number(r.rate) > 0
    );

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      let [h = "00", m = "00"] = String(header.bill_time || "00:00").split(":");
      let hour = Number(h);
      let minute = Number(m);
      if (isNaN(hour)) hour = 0;
      if (isNaN(minute)) minute = 0;
      if (header.bill_time_am_pm === "PM" && hour < 12) hour += 12;
      if (header.bill_time_am_pm === "AM" && hour === 12) hour = 0;
      const bill_time = header.date
        ? `${header.date} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`
        : null;

      const items = rows.map((r) => {
        const c = calc(r);
        return {
          product_id: Number(r.product_id),
          hsn_code: r.hsn_code,
          qty: Number(r.qty),
          rate: Number(r.rate),
          amount: c.base,
          discount_per_qty: Number(r.d1_percent || 0),
          discount_rate: c.perUnitDisc,
          discount_total: c.totalDisc,
          gst_percent: Number(r.gst_percent || 0),
          gst_amount: c.gstAmt,
          final_amount: c.final,
        };
      });

      // Derive mutable IDs
      const isVendor = header.party_type === "vendor";
      let vendor_id = isVendor && header.vendor_id !== "" ? Number(header.vendor_id) : null;
      let farmer_id = !isVendor && header.farmer_id !== "" ? Number(header.farmer_id) : null;

      // Validate selection early
      if (isVendor && !vendor_id) {
        await Swal.fire({ icon: "error", title: "Select vendor", text: "Please select a valid vendor", confirmButtonColor: "#dc2626" });
        return;
      }
      if (!isVendor && !farmer_id) {
        await Swal.fire({ icon: "error", title: "Select farmer", text: "Please select a valid farmer", confirmButtonColor: "#dc2626" });
        return;
      }

      // Hard guard: force the other id to null
      if (isVendor) {
        farmer_id = null;
      } else {
        vendor_id = null;
      }

      // Now build payload
      const payload = {
        po_no: header.po_no,
        party_type: header.party_type,
        vendor_id,
        farmer_id,
        date: header.date || null,
        bill_time,
        address: header.address || "",
        mobile_no: header.mobile_no || "",
        gst_no: header.gst_no || "",
        place_of_supply: header.place_of_supply || "",
        terms_condition: header.terms_condition || "",
        party_balance: header.party_balance,
        party_min_balance: header.party_min_balance,
        items,
        summary: totals,
      };

      const action = isEditMode
        ? updatePurchaseOrder({ id: purchaseOrder?._id || purchaseOrder?.id, data: payload })
        : createPurchaseOrder(payload);
      const result = await dispatch(action);

      if (result.error) {
        await Swal.fire({
          icon: "error",
          title: "Failed",
          text: result?.payload?.error || "Could not save Purchase Order",
          confirmButtonColor: "#dc2626",
        });
        return;
      }

      await Swal.fire({
        icon: "success",
        title: isEditMode ? "PO updated" : "PO created",
        text: isEditMode ? "Purchase Order updated successfully" : "Purchase Order created successfully",
        confirmButtonColor: "#2563eb",
      });

      if (!result.error) {
        await dispatch(fetchPurchaseOrders());
        // reset but keep current date/time so user can continue quickly
        setHeader((prev) => ({
          ...emptyHeader,
          date: prev.date,
          bill_time: prev.bill_time,
          bill_time_am_pm: prev.bill_time_am_pm,
        }));
        setRows([{ ...emptyRow }]);
        onSubmitted && onSubmitted();
      }
    } catch (err) {
      console.error("Error submitting purchase order:", err);
      alert("Failed to submit purchase order. Check console for details.");
    }
  };

  // UI designed like PurchaseForm
  return (
    <form onSubmit={onSubmit} className="p-3">
      {/* Header */}
      <div className="grid grid-cols-6 gap-3 border p-3 overflow-auto rounded">
        <div className="flex flex-col">
          <label className="text-xs">Bill Dateeee</label>
          <input type="date" className="border rounded p-1" name="date" value={header.date} onChange={onHeader} />
        </div>

        <div className="flex flex-col">
          <label className="text-xs">Party Type</label>
          <select className="border rounded p-1" value={header.party_type} onChange={onPartyTypeChange}>
            <option value="vendor">Vendor</option>
            <option value="farmer">Farmer</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs">{header.party_type === "vendor" ? "Vendor" : "Farmer"}</label>
          <select
            className="border rounded p-1"
            name={header.party_type === "vendor" ? "vendor_id" : "farmer_id"}
            value={header.party_type === "vendor" ? header.vendor_id : header.farmer_id}
            onChange={onPartyChange}
          >
            <option value="">Select</option>
            {(header.party_type === "vendor" ? vendors : farmers).map((p) => (
              <option key={String(p.id ?? p._id)} value={String(p.id ?? p._id)}>
                {p.vendor_name || p.name || p.firm_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs">ADDRESS</label>
          <input className="border rounded p-1" name="address" value={header.address} onChange={onHeader} />
        </div>
        <div className="flex flex-col">
          <label className="text-xs">MOBILE NO</label>
          <input className="border rounded p-1" name="mobile_no" value={header.mobile_no} onChange={onHeader} />
        </div>
        <div className="flex flex-col">
          <label className="text-xs">GST No</label>
          <input className="border rounded p-1" name="gst_no" value={header.gst_no} onChange={onHeader} />
        </div>

        <div className="flex flex-col">
          <label className="text-xs">PO No.</label>
          <input className="border rounded p-1" name="po_no" value={header.po_no} onChange={onHeader} />
        </div>

        <div className="flex flex-col">
          <label className="text-xs">Place of Supply</label>
          <input
            className="border rounded p-1"
            name="place_of_supply"
            value={header.place_of_supply}
            onChange={onHeader}
            placeholder="e.g., Maharashtra"
          />
        </div>

        <div className="flex flex-col col-span-2">
          <label className="text-xs">Terms</label>
          <textarea
            className="border rounded p-1 min-h-[60px]"
            name="terms_condition"
            value={header.terms_condition}
            onChange={onHeader}
            placeholder="Payment terms, delivery terms, etc."
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs">Party Balance</label>
          <input className="border rounded p-1 bg-gray-100" name="party_balance" value={fx(header.party_balance)} readOnly />
        </div>
      </div>

      <div className="bg-black text-yellow-300 text-center text-2xl font-semibold py-2 mt-3 mb-2 rounded">
        FINAL AMOUNT: {fx(totals.final)}
      </div>

      {/* Items */}
      <div className="overflow-auto">
        <table className="w-full text-sm border">
          <thead className="bg-green-700 text-white">
            <tr>
              {[
                "SI",
                "Item Name",
                "HSNCode",
                "Available",
                "QTY",
                "Rate",
                "Amount",
                "Disc %",
                "Per Qty Disc",
                "Total Disc",
                "GST%",
                "GST Amt",
                "FinalAmt",
                "Actions",
              ].map((h, idx) => (
                <th key={`${h}-${idx}`} className="border px-2 py-1 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const base = (r.qty || 0) * (r.rate || 0);
              const perUnitDisc = ((r.rate || 0) * (r.d1_percent || 0)) / 100;
              const totalDisc = (r.qty || 0) * perUnitDisc;
              const taxable = Math.max(0, base - totalDisc);
              const gstAmt = (taxable * (r.gst_percent || 0)) / 100;
              const final = taxable + gstAmt;

              return (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  <td className="border px-2 py-1">{i + 1}</td>

                  <td className="border px-2 py-1">
                    <div className="flex gap-1">
                      <select
                        className="border rounded p-1 w-44"
                        value={r.product_id}
                        onChange={(e) => onRow(i, "product_id", e.target.value)}
                      >
                        <option value="">Select</option>
                        {normalizedProducts.map((p) => (
                          <option key={p.id} value={String(p.id)}>
                            {p.product_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  <td className="border px-2 py-1">
                    <input
                      readOnly
                      className="border cursor-not-allowed bg-gray-100 rounded p-1 w-24"
                      value={r.hsn_code}
                      onChange={(e) => onRow(i, "hsn_code", e.target.value)}
                    />
                  </td>

                  <td className="border px-2 py-1">
                    <input readOnly className="border rounded p-1 w-20 bg-gray-100" value={r.available ?? 0} />
                  </td>

                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      className="border rounded p-1 w-20"
                      value={r.qty}
                      onChange={(e) => onRow(i, "qty", e.target.value)}
                    />
                  </td>

                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      className="border rounded p-1 w-20"
                      value={r.rate}
                      onChange={(e) => onRow(i, "rate", e.target.value)}
                    />
                  </td>

                  <td className="border px-2 py-1">{fx(base)}</td>

                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      className="border rounded p-1 w-16"
                      value={r.d1_percent}
                      onChange={(e) => onRow(i, "d1_percent", e.target.value)}
                    />
                  </td>

                  <td className="border px-2 py-1">
                    <input type="text" className="border rounded p-1 w-20 bg-gray-100" value={fx(perUnitDisc)} readOnly />
                  </td>

                  <td className="border px-2 py-1">
                    <input type="text" className="border rounded p-1 w-24 bg-gray-100" value={fx(totalDisc)} readOnly />
                  </td>

                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      className="border rounded p-1 w-16"
                      value={r.gst_percent}
                      onChange={(e) => onRow(i, "gst_percent", e.target.value)}
                    />
                  </td>

                  <td className="border px-2 py-1">{fx(gstAmt)}</td>
                  <td className="border px-2 py-1">{fx(final)}</td>

                  <td className="border px-2 py-1 text-center">
                    <button type="button" className="text-red-600 active:scale-95" onClick={() => removeRow(i)}>
                      ❌
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr className="bg-gray-100 font-semibold">
              <td className="border px-2 py-1" colSpan={6}>
                Totals
              </td>
              <td className="border px-2 py-1">{fx(totals.base)}</td>
              <td className="border px-2 py-1">—</td>
              <td className="border px-2 py-1">—</td>
              <td className="border px-2 py-1">{fx(totals.disc)}</td>
              <td className="border px-2 py-1">—</td>
              <td className="border px-2 py-1">{fx(totals.gst)}</td>
              <td className="border px-2 py-1">{fx(totals.final)}</td>
              <td className="border px-2 py-1"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex gap-2 mt-3">
        <button type="button" onClick={addRow} className="px-4 py-2 bg-blue-600 active:scale-95 text-white rounded">
          Add Item
        </button>
        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`px-6 py-2 active:scale-95 rounded text-white bg-green-700 transition-opacity duration-200 ${
            !isFormValid || loading ? "opacity-50 cursor-not-allowed" : "opacity-100 cursor-pointer"
          }`}
        >
          {loading ? (isEditMode ? "Updating..." : "Saving...") : isEditMode ? "Update" : "Create PO"}
        </button>
      </div>
    </form>
  );
};

export default PurchaseOrderForm;
