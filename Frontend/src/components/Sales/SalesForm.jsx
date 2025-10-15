// src/pages/sales/SalesForm.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import salesAPI from "../../axios/salesAPI";
import customersAPI from "../../axios/customerAPI";
import vendorAPI from "../../axios/vendorsAPI";
import farmerAPI from "../../axios/farmerAPI";
import productsAPI from "../../axios/productAPI";

const fx = (n) => (isNaN(n) ? "0.000" : Number(n).toFixed(3));

const getMarginPercentByQty = (qty) => {
  const q = Number(qty) || 0;
  if (q >= 1 && q <= 4) return 50;
  if (q >= 5 && q <= 9) return 30;
  if (q >= 10) return 25;
  return 0;
};
const getRowMarginPercent = (r) => getMarginPercentByQty(r.qty || 0);

const parseGst = (v) => {
  if (v == null) return 0;
  const s = String(v).replace("%", "");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

export default function SalesForm({ sale, onSubmitted }) {
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const isEditMode = Boolean(sale);

  const [useCostMargin] = useState(true);

  const [header, setHeader] = useState({
    sale_no: "",
    date: "",
    party_type: "customer",
    customer_id: "",
    vendor_id: "",
    farmer_id: "",
    address: "",
    mobile_no: "",
    gst_no: "",
    terms_condition: "",
    payment_status: "Unpaid",
    payment_method: "Cash",
    status: "Active",
    old_remaining: 0,
    cash_received: 0,
    party_balance: 0,
    party_min_balance: 0,
  });

  const emptyRow = {
    product_id: "",
    item_name: "",
    hsn_code: "",
    available: 0,
    qty: 1,
    cost_rate: 0,
    rate: 0,
    d1_percent: 0,
    gst_percent: 0,
    unit: "PCS",
    manualRate: false,
  };

  const [rows, setRows] = useState([{ ...emptyRow }]);
  const [errors, setErrors] = useState({ header: {}, rows: {} });

  const headerRefs = {
    date: useRef(null),
    sale_no: useRef(null),
    address: useRef(null),
    mobile_no: useRef(null),
    gst_no: useRef(null),
    payment_status: useRef(null),
    payment_method: useRef(null),
    cash_received: useRef(null),
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [custRes, vendRes, farmRes, prodRes] = await Promise.all([
          customersAPI.getAll(),
          vendorAPI.getAll(),
          farmerAPI.getAll(),
          productsAPI.getAll(),
        ]);
        const allCustomers = custRes?.data || [];
        const allVendors = vendRes?.data || [];
        const allFarmers = farmRes?.data || [];
        setCustomers(allCustomers);
        setVendors(allVendors);
        setFarmers(allFarmers);

        const normalized = (prodRes?.data || []).map((p) => ({
          id: p.id,
          product_name: p.product_name,
          hsn_code: p.hsn_code || "",
          available: Number(p.size || 0),
          cost_rate: Number(p.total || 0),
          gst_percent: parseGst(p.gst),
          raw: p,
        }));
        setProducts(normalized);

        if (isEditMode && sale) {
          const normalizedDate = sale.bill_date ? new Date(sale.bill_date).toISOString().split("T")[0] : "";
          const party_type = sale.party_type || "customer";

          const selectedCustomer = party_type === "customer" ? allCustomers.find((c) => Number(c.id) === Number(sale.customer_id)) : null;
          const selectedVendor   = party_type === "vendor"   ? allVendors.find((v) => Number(v.id) === Number(sale.vendor_id)) : null;
          const selectedFarmer   = party_type === "farmer"   ? allFarmers.find((f) => Number(f.id) === Number(sale.farmer_id)) : null;

          const phone = party_type === "customer" ? selectedCustomer?.phone : party_type === "vendor" ? selectedVendor?.contact_number : selectedFarmer?.contact_number;
          const address = party_type === "customer" ? selectedCustomer?.address : party_type === "vendor" ? selectedVendor?.address : "";
          const gst = party_type === "customer" ? (selectedCustomer?.gst_no || selectedCustomer?.GST_No || "") : party_type === "vendor" ? (selectedVendor?.gst_no || "") : "";

          setHeader((prev) => ({
            ...prev,
            sale_no: sale.bill_no || "",
            date: normalizedDate,
            party_type,
            customer_id: sale.customer_id || "",
            vendor_id: sale.vendor_id || "",
            farmer_id: sale.farmer_id || "",
            address: address || "",
            mobile_no: phone || "",
            gst_no: gst,
            terms_condition: sale.remarks || "",
            payment_status: sale.payment_status || "Unpaid",
            payment_method: sale.payment_method || "Cash",
            status: sale.status || "Active",
            old_remaining: 0,
            cash_received: 0,
            party_balance: Number(sale.party_balance ?? 0),
            party_min_balance: Number(sale.party_min_balance ?? 0),
          }));

          const mapped = (sale.items || []).map((r) => {
            const product = normalized.find((p) => Number(p.id) === Number(r.product_id));
            return {
              product_id: r.product_id,
              item_name: product?.product_name || r.item_name || "",
              hsn_code: product?.hsn_code || r.hsn_code || "",
              available: product?.available ?? 0,
              qty: Number(r.qty) || 1,
              cost_rate: Number(product?.cost_rate ?? 0),
              rate: Number(r.rate ?? 0),
              manualRate: true,
              d1_percent: Number(r.discount_rate) || 0,
              gst_percent: Number(r.gst_percent ?? product?.gst_percent ?? 0),
              unit: r.unit || "PCS",
            };
          });
          setRows(mapped.length ? mapped : [{ ...emptyRow }]);
        } else {
          const { data } = await salesAPI.getNewBillNo();
          setHeader((prev) => ({
            ...prev,
            sale_no: data?.bill_no || "",
            date: new Date().toISOString().split("T")[0],
            payment_status: "Unpaid",
            payment_method: "Cash",
            status: "Active",
            old_remaining: 0,
            cash_received: 0,
            party_type: "customer",
            customer_id: "",
            vendor_id: "",
            farmer_id: "",
            party_balance: 0,
            party_min_balance: 0,
            address: "",
            mobile_no: "",
            gst_no: "",
          }));
        }
      } catch (err) {
        Swal.fire({ icon: "error", title: "Failed to load", text: "Failed to load form data" });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [isEditMode, sale]);

  const onPartyTypeChange = async (e) => {
    const val = e.target.value;
    setHeader((p) => ({
      ...p,
      party_type: val,
      customer_id: "",
      vendor_id: "",
      farmer_id: "",
      address: "",
      mobile_no: "",
      gst_no: "",
      party_balance: 0,
      party_min_balance: 0,
      old_remaining: 0,
      cash_received: 0,
    }));
  };

  const onPartyChange = async (e) => {
    const id = e.target.value;
    const type = header.party_type;
    if (type === "customer") {
      const c = customers.find((x) => String(x.id) === String(id));
      setHeader((p) => ({
        ...p,
        customer_id: id,
        vendor_id: "",
        farmer_id: "",
        address: c?.address || "",
        mobile_no: c?.phone || "",
        gst_no: c?.gst_no || c?.GST_No || "",
        party_balance: Number(c?.balance ?? 0),
        party_min_balance: Number(c?.min_balance ?? 0),
      }));
      if (id) {
        try {
          const { data } = await salesAPI.getPartyPreviousDue("customer", id);
          setHeader((p) => ({ ...p, old_remaining: Number(data?.previous_due || 0), cash_received: 0 }));
        } catch {
          setHeader((p) => ({ ...p, old_remaining: 0, cash_received: 0 }));
        }
      }
    } else if (type === "vendor") {
      const v = vendors.find((x) => String(x.id) === String(id));
      setHeader((p) => ({
        ...p,
        vendor_id: id,
        customer_id: "",
        farmer_id: "",
        address: v?.address || "",
        mobile_no: v?.contact_number || "",
        gst_no: v?.gst_no || "",
        party_balance: Number(v?.balance ?? 0),
        party_min_balance: Number(v?.min_balance ?? 0),
        old_remaining: 0,
        cash_received: 0,
      }));
      if (id) {
        try {
          const { data } = await salesAPI.getPartyPreviousDue("vendor", id);
          setHeader((p) => ({ ...p, old_remaining: Number(data?.previous_due || 0), cash_received: 0 }));
        } catch {
          setHeader((p) => ({ ...p, old_remaining: 0, cash_received: 0 }));
        }
      }
    } else {
      const f = farmers.find((x) => String(x.id) === String(id));
      setHeader((p) => ({
        ...p,
        farmer_id: id,
        customer_id: "",
        vendor_id: "",
        address: "",
        mobile_no: f?.contact_number || "",
        gst_no: "",
        party_balance: Number(f?.balance ?? 0),
        party_min_balance: Number(f?.min_balance ?? 0),
        old_remaining: 0,
        cash_received: 0,
      }));
      if (id) {
        try {
          const { data } = await salesAPI.getPartyPreviousDue("farmer", id);
          setHeader((p) => ({ ...p, old_remaining: Number(data?.previous_due || 0), cash_received: 0 }));
        } catch {
          setHeader((p) => ({ ...p, old_remaining: 0, cash_received: 0 }));
        }
      }
    }
  };

  const onHeader = async (e) => {
    let { name, value } = e.target;
    if (name === "cash_received") value = value === "" ? "" : Number(value);
    setHeader((p) => ({ ...p, [name]: value }));
    setErrors((er) => ({ ...er, header: { ...er.header, [name]: false } }));
  };

  const recomputeSellingRate = (row) => {
    const q = Number(row.qty) || 0;
    const cost = Number(row.cost_rate) || 0;
    const mPct = getMarginPercentByQty(q);
    if (useCostMargin && !row.manualRate) {
      const selling = cost * (1 + mPct / 100);
      return Number.isFinite(selling) ? selling : 0;
    }
    return row.rate || 0;
  };

  const onRow = (i, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      const numeric = ["qty", "rate", "d1_percent", "gst_percent", "cost_rate"];
      let v = value;
      if (numeric.includes(field)) v = value === "" ? 0 : Number(value);
      next[i] = { ...next[i], [field]: v };

      setErrors((er) => ({
        ...er,
        rows: { ...er.rows, [i]: { ...(er.rows[i] || {}), [field]: false } },
      }));

      if (field === "product_id") {
        const product = products.find((p) => String(p.id) === String(value));
        next[i].item_name = product?.product_name || "";
        next[i].hsn_code = product?.hsn_code || "";
        next[i].cost_rate = Number(product?.cost_rate || 0);
        next[i].gst_percent = Number(product?.gst_percent || 0);
        next[i].unit = "PCS";
        next[i].available = Number(product?.available || 0);
        next[i].qty = 1;
        next[i].d1_percent = 0;
        next[i].manualRate = false;
        next[i].rate = recomputeSellingRate(next[i]);
      }

      if (field === "qty") {
        const avail = Number(next[i].available || 0);
        let q = Number(value || 0);
        if (q > avail) {
          q = avail;
          Swal.fire({ icon: "info", title: "Stock limit", text: "Qty limited to available stock" });
        } else if (q < 1) {
          q = 1;
        }
        next[i].qty = q;
        if (useCostMargin && !next[i].manualRate) {
          const tmp = { ...next[i], qty: q };
          next[i].rate = recomputeSellingRate(tmp);
        }
      }

      if (field === "rate") next[i].manualRate = true;
      if (field === "cost_rate" && useCostMargin && !next[i].manualRate) next[i].rate = recomputeSellingRate(next[i]);

      return next;
    });
  };

  const calc = (r) => {
    const qty = Number(r.qty) || 0;
    const rate = Number(r.rate) || 0;
    const base = qty * rate;
    const perUnitDisc = (rate * (Number(r.d1_percent) || 0)) / 100;
    const totalDisc = qty * perUnitDisc;
    const taxable = Math.max(base - totalDisc, 0);
    const gstAmt = (taxable * (Number(r.gst_percent) || 0)) / 100;
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

  const saleTotal = Number(totals.final || 0);
  const netDue = Math.max(Number(header.old_remaining || 0) + saleTotal - Number(header.cash_received || 0), 0);

  const validateHeader = () => {
    const req = ["date", "sale_no"];
    if (header.party_type === "customer") req.push("customer_id");
    if (header.party_type === "vendor") req.push("vendor_id");
    if (header.party_type === "farmer") req.push("farmer_id");
    const newErr = {};
    let firstKey = null;
    req.forEach((k) => {
      const miss = !header[k];
      newErr[k] = miss;
      if (miss && !firstKey) firstKey = k;
    });
    setErrors((er) => ({ ...er, header: { ...er.header, ...newErr } }));
    return firstKey;
  };

  const validateRows = () => {
    let first = { rowIdx: null, field: null };
    const newRowsErr = {};
    rows.forEach((r, i) => {
      const rowErr = {};
      if (!r.product_id) {
        rowErr.product_id = true;
        if (first.rowIdx === null) first = { rowIdx: i, field: "product_id" };
      }
      if (!(Number(r.qty) > 0)) {
        rowErr.qty = true;
        if (first.rowIdx === null) first = { rowIdx: i, field: "qty" };
      }
      if (!(Number(r.rate) > 0)) {
        rowErr.rate = true;
        if (first.rowIdx === null) first = { rowIdx: i, field: "rate" };
      }
      newRowsErr[i] = rowErr;
    });
    setErrors((er) => ({ ...er, rows: { ...er.rows, ...newRowsErr } }));
    return first.rowIdx !== null ? first : null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const missingHeaderKey = validateHeader();
    if (missingHeaderKey) {
      Swal.fire({ icon: "error", title: "Header missing", text: `Please fill ${missingHeaderKey.replace("_", " ")}` });
      headerRefs[missingHeaderKey]?.current?.focus?.();
      return;
    }
    const firstBad = validateRows();
    if (firstBad) {
      Swal.fire({ icon: "error", title: "Item row missing", text: `Please fill row ${firstBad.rowIdx + 1} - ${firstBad.field}` });
      return;
    }

    try {
      setLoading(true);

      const bad = rows.find((r) => Number(r.qty) > Number(r.available || 0));
      if (bad) {
        Swal.fire({ icon: "error", title: "Stock exceeded", text: "Quantity exceeds available stock" });
        setLoading(false);
        return;
      }

      const derivedPaymentStatus = netDue <= 0 ? "Paid" : Number(header.cash_received || 0) > 0 ? "Partial" : "Unpaid";

      const payload = {
        party_type: header.party_type,
        customer_id: header.party_type === "customer" ? header.customer_id : null,
        vendor_id:   header.party_type === "vendor"   ? header.vendor_id   : null,
        farmer_id:   header.party_type === "farmer"   ? header.farmer_id   : null,
        bill_no: header.sale_no,
        bill_date: header.date,
        status: header.status || "Active",
        payment_status: derivedPaymentStatus,
        payment_method: header.payment_method || "Cash",
        remarks: header.terms_condition || "",
        cash_received: Number(header.cash_received || 0),
        items: rows.map((r) => ({
          product_id: r.product_id,
          qty: Number(r.qty),
          discount_rate: Number(r.d1_percent || 0),
          gst_percent: Number(r.gst_percent || 0),
          unit: r.unit || "PCS",
          rate: Number(r.rate || 0),
        })),
      };

      if (isEditMode) {
        await salesAPI.update(sale.id, payload);
        await Swal.fire({ icon: "success", title: "Sale updated", text: "Sale updated successfully", confirmButtonColor: "#2563eb" });
      } else {
        const { data: result } = await salesAPI.create(payload);
        await Swal.fire({
          icon: "success",
          title: "Sale created",
          html: `
            <div style="text-align:left">
              <div>Old Due: <b>${Number(result?.previous_due || 0).toFixed(2)}</b></div>
              <div>Sale Total: <b>${Number(result?.total_amount || 0).toFixed(2)}</b></div>
              <div>Cash Received: <b>${Number(result?.cash_received || 0).toFixed(2)}</b></div>
              <div>New Due: <b>${Number(result?.new_due || 0).toFixed(2)}</b></div>
              <div>Status: <b>${result?.payment_status || "-"}</b></div>
            </div>
          `,
          confirmButtonColor: "#2563eb",
        });
      }

      setHeader({
        sale_no: "",
        date: "",
        party_type: "customer",
        customer_id: "",
        vendor_id: "",
        farmer_id: "",
        address: "",
        mobile_no: "",
        gst_no: "",
        terms_condition: "",
        payment_status: "Unpaid",
        payment_method: "Cash",
        status: "Active",
        old_remaining: 0,
        cash_received: 0,
        party_balance: 0,
        party_min_balance: 0,
      });
      setRows([{ ...emptyRow }]);
      setErrors({ header: {}, rows: {} });
      onSubmitted && onSubmitted();
    } catch (e2) {
      Swal.fire({ icon: "error", title: "Failed to save", text: e2?.response?.data?.error || "Failed to save sale", confirmButtonColor: "#dc2626" });
    } finally {
      setLoading(false);
    }
  };

  const errClass = "border-red-500 ring-1 ring-red-400";

  return (
    <form onSubmit={onSubmit} className="bg-white shadow-lg rounded-xl p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">{isEditMode ? "Update Sale" : "Create Sale"}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Old Remaining</span>
                <span className="font-semibold">{fx(header.old_remaining)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Sale Total</span>
                <span className="font-semibold">{fx(totals.final)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Due After Pay</span>
                <span className="text-base font-semibold">{fx(netDue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Status</span>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                    netDue <= 0
                      ? "bg-green-100 text-green-700"
                      : Number(header.cash_received || 0) > 0
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {netDue <= 0 ? "Paid" : Number(header.cash_received || 0) > 0 ? "Partial" : "Unpaid"}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Party</span>
                  <span className="text-xs text-gray-800">
                    {(() => {
                      if (header.party_type === "customer") {
                        const c = customers.find((x) => Number(x.id) === Number(header.customer_id));
                        return c?.name || "-";
                      } else if (header.party_type === "vendor") {
                        const v = vendors.find((x) => Number(x.id) === Number(header.vendor_id));
                        return v?.vendor_name || v?.name || "-";
                      } else {
                        const f = farmers.find((x) => Number(x.id) === Number(header.farmer_id));
                        return f?.name || "-";
                      }
                    })()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Paid Amount</span>
                  <span className="text-xs text-gray-800">{fx(header.cash_received)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="lg:col-span-2">
          <div className="bg-white border rounded-xl shadow-sm p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <label htmlFor="date" className="text-sm text-gray-600 mb-1">Date</label>
                <input
                  id="date"
                  ref={headerRefs.date}
                  type="date"
                  className={`border p-2 rounded-lg ${errors.header.date ? errClass : ""}`}
                  value={header.date}
                  onChange={(e) => onHeader({ target: { name: "date", value: e.target.value } })}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Party Type</label>
                <select
                  className="border p-2 rounded-lg"
                  value={header.party_type}
                  onChange={onPartyTypeChange}
                >
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                  <option value="farmer">Farmer</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">
                  {header.party_type === "customer" ? "Customer" : header.party_type === "vendor" ? "Vendor" : "Farmer"}
                </label>
                <select
                  className={`border p-2 rounded-lg ${
                    errors.header[header.party_type === "customer" ? "customer_id" : header.party_type === "vendor" ? "vendor_id" : "farmer_id"]
                      ? errClass
                      : ""
                  }`}
                  value={
                    header.party_type === "customer"
                      ? header.customer_id
                      : header.party_type === "vendor"
                      ? header.vendor_id
                      : header.farmer_id
                  }
                  onChange={onPartyChange}
                >
                  <option value="">Select</option>
                  {(header.party_type === "customer" ? customers : header.party_type === "vendor" ? vendors : farmers).map((p) => (
                    <option key={p.id} value={p.id}>
                      {header.party_type === "vendor" ? (p.vendor_name || p.name) : p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Bill No</label>
                <input
                  className={`border p-2 rounded-lg ${errors.header.sale_no ? errClass : ""}`}
                  value={header.sale_no}
                  onChange={(e) => onHeader({ target: { name: "sale_no", value: e.target.value } })}
                />
              </div> */}
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Mobile No.</label>
                <input
                  className="border p-2 rounded-lg"
                  placeholder="Mobile"
                  value={header.mobile_no}
                  onChange={(e) => setHeader((p) => ({ ...p, mobile_no: e.target.value }))}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">GST No.</label>
                <input
                  className="border p-2 rounded-lg"
                  placeholder="GST No."
                  value={header.gst_no}
                  onChange={(e) => setHeader((p) => ({ ...p, gst_no: e.target.value }))}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Address</label>
                <input
                  className="border p-2 rounded-lg"
                  placeholder="Address"
                  value={header.address}
                  onChange={(e) => setHeader((p) => ({ ...p, address: e.target.value }))}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
                <input
                  id="cash_received"
                  ref={headerRefs.cash_received}
                  type="number"
                  min={0}
                  step="0.01"
                  className="border border-gray-300 rounded-lg p-2"
                  value={header.cash_received}
                  onChange={(e) => {
                    const maxVal = Number(header.old_remaining || 0) + Number(totals.final || 0);
                    const val = e.target.value === "" ? "" : Math.max(0, Math.min(Number(e.target.value), maxVal));
                    onHeader({ target: { name: "cash_received", value: val } });
                  }}
                  placeholder="Enter paid amount"
                />
                <span className="text-xs text-gray-500 mt-1">
                  Max allowed: {fx(Number(header.old_remaining || 0) + Number(totals.final || 0))}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Party Balance</label>
                <input className="border p-2 rounded-lg bg-gray-100" value={fx(header.party_balance)} readOnly />
              </div>
              {/* <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Min Balance</label>
                <input className="border p-2 rounded-lg bg-gray-100" value={fx(header.party_min_balance)} readOnly />
              </div> */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Payment Method</label>
                <select
                  className="border p-2 rounded-lg"
                  value={header.payment_method}
                  onChange={(e) => setHeader((p) => ({ ...p, payment_method: e.target.value }))}
                >
                  <option>Cash</option>
                  <option>Card</option>
                  <option>Online</option>
                  <option>Credit Card</option>
                  <option>UPI</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Payment Status</label>
                <div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                      netDue <= 0
                        ? "bg-green-100 text-green-700"
                        : Number(header.cash_received || 0) > 0
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {netDue <= 0 ? "Paid" : Number(header.cash_received || 0) > 0 ? "Partial" : "Unpaid"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border text-xs">
          <thead>
            <tr className="bg-green-700 text-white">
              <th className="px-2 py-2 border text-center w-10">Sl</th>
              <th className="px-2 py-2 border text-left">Item Name</th>
              <th className="px-2 py-2 border text-left">HSNCode</th>
              <th className="px-2 py-2 border text-center w-20">Aval QTY</th>
              <th className="px-2 py-2 border text-center w-16">QTY</th>
              <th className="px-2 py-2 border text-right">Rate</th>
              <th className="px-2 py-2 border text-right">Amount</th>
              <th className="px-2 py-2 border text-right">Disc %</th>
              <th className="px-2 py-2 border text-right">Per Qty Disc</th>
              <th className="px-2 py-2 border text-right">Total Disc</th>
              <th className="px-2 py-2 border text-right">GST%</th>
              <th className="px-2 py-2 border text-right">GST Amt</th>
              <th className="px-2 py-2 border text-right">FinalAmt</th>
              <th className="px-2 py-2 border text-center w-16">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const base = Number(r.qty || 0) * Number(r.rate || 0);
              const perUnitDisc = (Number(r.rate || 0) * (Number(r.d1_percent) || 0)) / 100;
              const totalDisc = Number(r.qty || 0) * perUnitDisc;
              const taxable = Math.max(base - totalDisc, 0);
              const gstAmt = (taxable * (Number(r.gst_percent) || 0)) / 100;
              const final = taxable + gstAmt;

              return (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  <td className="px-2 py-1 border text-center">{i + 1}</td>
                  <td className="px-2 py-1 border">
                    <div className="flex gap-1">
                      <select
                        className="border rounded p-1 w-44"
                        value={r.product_id}
                        onChange={(e) => {
                          const pid = e.target.value;
                          onRow(i, "product_id", pid);
                          const product = products.find((p) => String(p.id) === String(pid));
                          if (product) {
                            onRow(i, "item_name", product.product_name || "");
                            onRow(i, "hsn_code", product.hsn_code || "");
                            onRow(i, "cost_rate", Number(product.cost_rate || 0));
                            onRow(i, "gst_percent", Number(product.gst_percent || 0));
                            onRow(i, "available", Number(product.available || 0));
                            onRow(i, "qty", 1);
                          }
                        }}
                      >
                        <option value="">Select</option>
                        {products.map((p) => (
                          <option key={p.id} value={String(p.id)}>
                            {p.product_name}
                          </option>
                        ))}
                      </select>
                      <input
                        readOnly
                        className="border rounded p-1 w-36 bg-gray-100"
                        value={r.item_name}
                        placeholder="Item"
                      />
                    </div>
                  </td>
                  <td className="px-2 py-1 border bg-gray-100">
                    <input readOnly className="border rounded w-full h-8 px-2 text-xs" value={r.hsn_code} />
                  </td>
                  <td className="px-2 py-1 border text-center">
                    <input readOnly className="border rounded p-1 w-20 bg-gray-100" value={r.available ?? 0} />
                  </td>
                  <td className="px-2 py-1 border text-center">
                    <input
                      type="number"
                      min={1}
                      max={Number(r.available || 0)}
                      className={`border rounded w-16 h-8 px-2 text-center text-xs ${errors.rows[i]?.qty ? errClass : ""}`}
                      value={r.qty}
                      onChange={(e) => onRow(i, "qty", e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-1 border text-right">
                    <input
                      type="number"
                      readOnly={!r.manualRate}
                      className={`border rounded w-20 h-8 px-2 text-right text-xs ${!r.manualRate ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      value={r.rate}
                      onChange={(e) => onRow(i, "rate", e.target.value)}
                    />
                    <div className="text-[10px] text-gray-500 text-right">
                      {useCostMargin && !r.manualRate ? `Margin: ${getRowMarginPercent(r)}% (auto)` : "Manual rate"}
                    </div>
                  </td>
                  <td className="px-2 py-1 border text-right">{fx(base)}</td>
                  <td className="px-2 py-1 border text-right">
                    <input
                      type="number"
                      className="border rounded w-16 h-8 px-2 text-right text-xs"
                      value={r.d1_percent}
                      onChange={(e) => onRow(i, "d1_percent", e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-1 border text-right">
                    <div className="flex flex-col items-end">
                      <input
                        type="text"
                        className="border rounded w-20 h-8 px-2 text-right text-xs bg-gray-100 cursor-not-allowed"
                        value={fx(perUnitDisc)}
                        readOnly
                      />
                      <div className="text-[10px] text-gray-500">
                        x {r.qty || 0} = {fx(totalDisc)}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-1 border text-right">
                    <span className="font-semibold">{fx(totalDisc)}</span>
                  </td>
                  <td className="px-2 py-1 border text-right">
                    <input
                      type="number"
                      className="border rounded w-16 h-8 px-2 text-right text-xs"
                      value={r.gst_percent}
                      onChange={(e) => onRow(i, "gst_percent", e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-1 border text-right">{fx(gstAmt)}</td>
                  <td className="px-2 py-1 border text-right">{fx(final)}</td>
                  <td className="px-2 py-1 border text-center">
                    <button
                      type="button"
                      className="h-8 w-8 grid place-items-center rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                      onClick={async () => {
                        const res = await Swal.fire({
                          title: "Remove this row?",
                          text: "This item will be removed.",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonText: "Remove",
                          cancelButtonText: "Cancel",
                          confirmButtonColor: "#dc2626",
                        });
                        if (res.isConfirmed) {
                          setRows((p) => p.filter((_, idx) => idx !== i));
                          setErrors((er) => {
                            const copy = { ...er };
                            delete copy.rows[i];
                            return copy;
                          });
                        }
                      }}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr className="bg-gray-100 font-semibold text-right text-xs">
              <td className="px-2 py-2 border text-center"></td>
              <td className="px-2 py-2 border text-left">Totals</td>
              <td className="px-2 py-2 border text-left"></td>
              <td className="px-2 py-2 border text-center"></td>
              <td className="px-2 py-2 border text-center">
                {fx(rows.reduce((a, r) => a + Number(r.qty || 0), 0))}
              </td>
              <td className="px-2 py-2 border text-right">
                {fx(rows.reduce((a, r) => a + Number(r.rate || 0), 0))}
              </td>
              <td className="px-2 py-2 border text-right">{fx(totals.base)}</td>
              <td className="px-2 py-2 border text-right"></td>
              <td className="px-2 py-2 border text-right">—</td>
              <td className="px-2 py-2 border text-right">{fx(totals.disc)}</td>
              <td className="px-2 py-2 border text-right"></td>
              <td className="px-2 py-2 border text-right">{fx(totals.gst)}</td>
              <td className="px-2 py-2 border text-right">{fx(totals.final)}</td>
              <td className="px-2 py-2 border text-center"></td>
            </tr>
            <tr>
              <td className="px-2 py-1 border" colSpan={14}>
                <button
                  className="px-2 py-1 bg-gray-200 rounded text-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    setRows((p) => [...p, { ...emptyRow }]);
                  }}
                  type="button"
                >
                  Add Row
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Actions */}
      <div className="mt-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 rounded-lg"
            onClick={() => {
              setHeader({
                sale_no: "",
                date: "",
                party_type: "customer",
                customer_id: "",
                vendor_id: "",
                farmer_id: "",
                address: "",
                mobile_no: "",
                gst_no: "",
                terms_condition: "",
                payment_status: "Unpaid",
                payment_method: "Cash",
                status: "Active",
                old_remaining: 0,
                cash_received: 0,
                party_balance: 0,
                party_min_balance: 0,
              });
              setRows([{ ...emptyRow }]);
              setErrors({ header: {}, rows: {} });
            }}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60"
          >
            {isEditMode ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}
