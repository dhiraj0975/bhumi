import React, { useEffect, useMemo, useState } from "react";
import { refApi, soApi } from "../../axios/soApi.js";

const fx = (n, d = 2) => (isNaN(n) ? (0).toFixed(d) : Number(n).toFixed(d));

const calcLine = (r) => {
  const qty = Number(r.qty) || 0;
  const rate = Number(r.rate) || 0;
  const d1 = Number(r.d1_percent) || 0;
  const gst = Number(r.gst_percent) || 0;
  const amount = qty * rate;
  const discPerUnit = (rate * d1) / 100;
  const discTotal = discPerUnit * qty;
  const taxable = Math.max(amount - discTotal, 0);
  const gstAmt = (taxable * gst) / 100;
  const finalAmt = taxable + gstAmt;
  return { amount, discPerUnit, discTotal, taxable, gstAmt, finalAmt };
};

export default function CreateSalesOrder({ so = null, onSaved }) {
  const isEditMode = Boolean(so);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    so_no: "",
    customer_id: "",
    date: "",
    bill_time: "",
    bill_time_am_pm: "PM",
    address: "",
    mobile_no: "",
    gst_no: "",
    place_of_supply: "",
    terms_condition: "",
    items: [{ product_id: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0 }],
  });

  useEffect(() => {
    (async () => {
      try {
        const [cRes, pRes] = await Promise.all([refApi.customers(), refApi.products()]);
        setCustomers(cRes.data || []);
        const plist = pRes.data?.list || pRes.data || [];
        const normalized = plist.map((p) => ({
          id: p.id ?? p._id,
          product_name: p.product_name,
          hsn_code: p.hsn_code || "",
          default_rate: Number(p.sale_rate ?? p.rate ?? p.value ?? 0),
          default_gst: Number(p.gst_percent ?? p.gst_rate ?? p.gst ?? 0),
            available: Number(p.size ?? p.stock ?? p.available ?? 0), // IMPORTANT
          raw: p,
        }));
        setProducts(normalized);
      } catch (e) {
        console.error(e);
        alert(e?.response?.data?.error || e.message || "Failed to load reference data");
      }
    })();
  }, []);

  useEffect(() => {
    if (!isEditMode || !so) return;
    const normalizedDate = so.date ? new Date(so.date).toISOString().split("T")[0] : "";
    setForm((p) => ({
      ...p,
      so_no: so.so_no || "",
      customer_id: String(so.customer_id || ""),
      date: normalizedDate,
      bill_time: "",
      bill_time_am_pm: "PM",
      address: so.address || "",
      mobile_no: so.mobile_no || "",
      gst_no: so.gst_no || "",
      place_of_supply: so.place_of_supply || "",
      terms_condition: so.terms_condition || "",
      items:
        so.items?.map((it) => {
          const prod = products.find((x) => String(x.id) === String(it.product_id));
          return {
            product_id: String(it.product_id || ""),
            hsn_code: it.hsn_code || prod?.hsn_code || "",
            qty: Number(it.qty || 0),
            rate: Number(it.rate || prod?.default_rate || 0),
            d1_percent: Number(it.discount_per_qty ?? 0),
            gst_percent: Number(it.gst_percent ?? prod?.default_gst ?? 0),
          };
        }) || [{ product_id: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0 }],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, so, products]);

  const onHeader = (e) => {
    const { name, value } = e.target;
    if (name === "customer_id") {
      const c = customers.find((x) => String(x.id) === String(value));
      if (c) {
        setForm((p) => ({
          ...p,
          customer_id: String(value),
          address: c.address || "",
          mobile_no: c.phone || "",
          gst_no: c.add_gst ? c.gst_no || "" : "",
        }));
        return;
      }
    }
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onItem = (i, e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev };
      const row = { ...next.items[i] };
      const numeric = ["qty", "rate", "d1_percent", "gst_percent", "product_id"];
      row[name] = numeric.includes(name) ? (value === "" ? "" : Number(value)) : value;

      if (name === "product_id") {
        const p = products.find((x) => String(x.id) === String(value));
        row.hsn_code = p?.hsn_code || "";
        if ((!row.rate || row.rate === 0) && p?.default_rate != null) row.rate = Number(p.default_rate);
        if ((!row.gst_percent || row.gst_percent === 0) && p?.default_gst != null) row.gst_percent = Number(p.default_gst);
          row.available = Number(p?.available || 0); // ← add this line
      }

      next.items = next.items.map((r, idx) => (idx === i ? row : r));
      return next;
    });
  };

  const addItem = () =>
    setForm((p) => ({
      ...p,
      items: [...p.items, { product_id: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0 }],
    }));

  const removeItem = (i) =>
    setForm((p) => ({
      ...p,
      items: p.items.filter((_, idx) => idx !== i),
    }));

  const totals = useMemo(() => {
    return form.items.reduce(
      (a, r) => {
        const c = calcLine({
          qty: Number(r.qty || 0),
          rate: Number(r.rate || 0),
          d1_percent: Number(r.d1_percent || 0),
          gst_percent: Number(r.gst_percent || 0),
        });
        a.taxable += c.taxable;
        a.gst += c.gstAmt;
        a.final += c.finalAmt;
        return a;
      },
      { taxable: 0, gst: 0, final: 0 }
    );
  }, [form.items]);

  const isValid = useMemo(() => {
    const headOk = form.so_no && Number(form.customer_id) > 0;
    const itemsOk =
      form.items.length > 0 &&
      form.items.every((r) => Number(r.product_id) > 0 && Number(r.qty) > 0 && Number(r.rate) > 0);
    return Boolean(headOk && itemsOk);
  }, [form]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let [h = "00", m = "00"] = String(form.bill_time || "00:00").split(":");
      let hour = Number(h);
      let minute = Number(m);
      if (isNaN(hour)) hour = 0;
      if (isNaN(minute)) minute = 0;
      if (form.bill_time_am_pm === "PM" && hour < 12) hour += 12;
      if (form.bill_time_am_pm === "AM" && hour === 12) hour = 0;
      const bill_time = form.date
        ? `${form.date} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`
        : null;

      const items = form.items.map((r) => ({
        product_id: Number(r.product_id),
        hsn_code: r.hsn_code || "",
        qty: Number(r.qty || 0),
        rate: Number(r.rate || 0),
        discount_per_qty: Number(r.d1_percent || 0),
        gst_percent: Number(r.gst_percent || 0),
      }));

      const payload = {
        so_no: form.so_no,
        customer_id: Number(form.customer_id),
        date: form.date || null,
        bill_time,
        address: form.address || "",
        mobile_no: form.mobile_no || "",
        gst_no: form.gst_no || "",
        place_of_supply: form.place_of_supply || "",
        terms_condition: form.terms_condition || "",
        items,
      };

      if (isEditMode) {
        await soApi.update(so.id || so._id, payload);
      } else {
        await soApi.create(payload);
      }

      setLoading(false);
      onSaved && onSaved();

      if (!isEditMode) {
        setForm({
          so_no: "",
          customer_id: "",
          date: "",
          bill_time: "",
          bill_time_am_pm: "PM",
          address: "",
          mobile_no: "",
          gst_no: "",
          place_of_supply: "",
          terms_condition: "",
          items: [{ product_id: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0 }],
        });
      }
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.error ||
        (err?.message?.includes("ER_DUP_ENTRY")
          ? "SO number already exists. Please use a unique SO No."
          : err.message) ||
        "Failed to save SO";
      alert(msg);
      setLoading(false);
    }
  };

  return (
<form onSubmit={onSubmit} className="bg-white rounded-xl mb-6">
  {/* Title */}
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-xl font-bold">{isEditMode ? "Edit Sales Order" : "Create Sales Order"}</h3>
    <div className="text-right text-xs text-gray-500">
      <div>Date: <span className="font-medium">{form.date || "-"}</span></div>
      <div>Time: <span className="font-medium">{form.bill_time || "-"}</span></div>
    </div>
  </div>

  {/* Summary + Header */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
    {/* Summary Card */}
    <div className="lg:col-span-1">
      <div className="bg-white border rounded-xl shadow-sm p-4">
        <div className="text-sm font-semibold text-gray-800 mb-2">Payment Summary</div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Old Remaining</span>
            <span className="font-semibold">{fx(0, 3)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Sale Total</span>
            <span className="font-semibold">{fx(totals.final, 3)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Due After Pay</span>
            <span className="font-semibold">{fx(totals.final, 3)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Status</span>
            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-700">Paid</span>
          </div>

          <div className="pt-2 border-t space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Party</span>
              <span className="text-gray-800">
                {customers.find((x) => Number(x.id) === Number(form.customer_id))?.name || "-"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Paid Amount</span>
              <span className="text-gray-800">{fx(0, 3)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Header Card */}
    <div className="lg:col-span-2">
      <div className="bg-white border rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Date</label>
            <input type="date" className="border rounded-lg p-2" name="date" value={form.date} onChange={onHeader} />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Party Type</label>
            <div className="border rounded-lg p-2 bg-white">Customer</div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Customer</label>
            <select className="border rounded-lg p-2" name="customer_id" value={form.customer_id} onChange={onHeader}>
              <option value="">Select</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Paid Amount</label>
            <input className="border rounded-lg p-2" placeholder="0" value={0} readOnly />
            <span className="text-[10px] text-gray-500">Max allowed: 0.000</span>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Mobile No.</label>
            <input className="border rounded-lg p-2" name="mobile_no" value={form.mobile_no} onChange={onHeader} placeholder="Mobile" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">GST No.</label>
            <input className="border rounded-lg p-2" name="gst_no" value={form.gst_no} onChange={onHeader} placeholder="GST No." />
          </div>

          <div className="flex flex-col lg:col-span-2">
            <label className="text-sm text-gray-600 mb-1">Address</label>
            <input className="border rounded-lg p-2" name="address" value={form.address} onChange={onHeader} placeholder="Address" />
          </div>

          <div className="flex flex-col lg:col-span-2">
            <label className="text-sm text-gray-600 mb-1">Party Balance</label>
            <input className="border rounded-lg p-2 bg-gray-100" value={fx(0, 3)} readOnly />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Payment Method</label>
            <select className="border rounded-lg p-2" value="Cash" onChange={() => {}}>
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
              <option>Bank</option>
              <option>Credit</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Payment Status</label>
            <div className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-700 w-min">Paid</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Items Table */}
  <div className="mt-4 overflow-x-auto">
    <table className="min-w-full border text-xs">
      <thead className="bg-green-700 text-white">
        <tr>
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
        {form.items.map((it, i) => {
          const { amount, discPerUnit, discTotal, taxable, gstAmt, finalAmt } = calcLine(it);
          return (
            <tr key={i} className="odd:bg-white even:bg-gray-50">
              <td className="px-2 py-1 border text-center">{i + 1}</td>

              <td className="px-2 py-1 border">
                <div className="flex gap-1">
                  <select
                    className="border rounded p-1 w-44"
                    name="product_id"
                    value={it.product_id}
                    onChange={(e) => onItem(i, e)}
                  >
                    <option value="">Select</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.product_name}</option>
                    ))}
                  </select>
                  {/* <input readOnly className="border rounded p-1 w-36 bg-gray-100" value={it.item_name || ""} placeholder="Item" /> */}
                </div>
              </td>

              <td className="px-2 py-1 border bg-gray-100">
                <input readOnly className="border rounded w-full h-8 px-2 text-xs" name="hsn_code" value={it.hsn_code || ""} />
              </td>

              <td className="px-2 py-1 border text-center">
<input readOnly className="border rounded p-1 w-20 bg-gray-100" value={it.available ?? 0} />
              </td>

              <td className="px-2 py-1 border text-center">
                <input
                  type="number"
                  min={1}
                  className="border rounded w-16 h-8 px-2 text-center text-xs"
                  name="qty"
                  value={it.qty}
                  onChange={(e) => onItem(i, e)}
                />
              </td>

              <td className="px-2 py-1 border text-right">
                <input
                  type="number"
                  className="border rounded w-20 h-8 px-2 text-right text-xs"
                  name="rate"
                  value={it.rate}
                  onChange={(e) => onItem(i, e)}
                />
                {/* <div className="text-[10px] text-gray-500 text-right">Margin: 50% (auto)</div> */}
              </td>

              <td className="px-2 py-1 border text-right">{fx(amount, 3)}</td>

              <td className="px-2 py-1 border text-right">
                <input
                  type="number"
                  className="border rounded w-16 h-8 px-2 text-right text-xs"
                  name="d1_percent"
                  value={it.d1_percent}
                  onChange={(e) => onItem(i, e)}
                />
              </td>

              <td className="px-2 py-1 border text-right">
                <div className="flex flex-col items-end">
                  <input
                    type="text"
                    className="border rounded w-20 h-8 px-2 text-right text-xs bg-gray-100 cursor-not-allowed"
                    value={fx(discPerUnit, 3)}
                    readOnly
                  />
                  <div className="text-[10px] text-gray-500">x {it.qty || 0} = {fx(discTotal, 3)}</div>
                </div>
              </td>

              <td className="px-2 py-1 border text-right">
                <span className="font-semibold">{fx(discTotal, 3)}</span>
              </td>

              <td className="px-2 py-1 border text-right">
                <input
                  type="number"
                  className="border rounded w-16 h-8 px-2 text-right text-xs"
                  name="gst_percent"
                  value={it.gst_percent}
                  onChange={(e) => onItem(i, e)}
                />
              </td>

              <td className="px-2 py-1 border text-right">{fx(gstAmt, 3)}</td>
              <td className="px-2 py-1 border text-right">{fx(finalAmt, 3)}</td>

              <td className="px-2 py-1 border text-center">
                <button
                  type="button"
                  className="h-8 w-8 grid place-items-center rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                  onClick={() => removeItem(i)}
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
          <td className="px-2 py-1 border text-center"></td>
          <td className="px-2 py-1 border text-left">Totals</td>
          <td className="px-2 py-1 border text-left"></td>
          <td className="px-2 py-1 border text-center"></td>
          <td className="px-2 py-1 border text-center">{fx(form.items.reduce((a, r) => a + Number(r.qty || 0), 0), 3)}</td>
          <td className="px-2 py-1 border text-right">{fx(form.items.reduce((a, r) => a + Number(r.rate || 0), 0), 3)}</td>
          <td className="px-2 py-1 border text-right">{fx(totals.taxable, 3)}</td>
          <td className="px-2 py-1 border text-right"></td>
          <td className="px-2 py-1 border text-right">—</td>
          <td className="px-2 py-1 border text-right">{fx(form.items.reduce((a, r) => a + (Number(r.qty||0)*((Number(r.rate||0)*Number(r.d1_percent||0))/100)), 0), 3)}</td>
          <td className="px-2 py-1 border text-right"></td>
          <td className="px-2 py-1 border text-right">{fx(totals.gst, 3)}</td>
          <td className="px-2 py-1 border text-right">{fx(totals.final, 3)}</td>
          <td className="px-2 py-1 border text-center"></td>
        </tr>
        <tr>
          <td className="px-2 py-1 border" colSpan={14}>
            <button
              className="px-2 py-1 bg-gray-200 rounded text-xs"
              onClick={(e) => { e.preventDefault(); addItem(); }}
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
  <div className="flex justify-end gap-3 mt-4">
    <button
      type="button"
      className="px-4 py-2 bg-gray-200 rounded-lg"
      onClick={() => {
        setForm({
          so_no: "",
          customer_id: "",
          date: "",
          bill_time: "",
          bill_time_am_pm: "PM",
          address: "",
          mobile_no: "",
          gst_no: "",
          place_of_supply: "",
          terms_condition: "",
          items: [{ product_id: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0 }],
        });
      }}
    >
      Reset
    </button>

    <button
      type="submit"
      disabled={!isValid || loading}
      className={`px-6 py-2 rounded-lg text-white ${!isValid || loading ? "bg-green-700/50 cursor-not-allowed" : "bg-green-700 hover:bg-green-800 active:scale-95"}`}
    >
      {isEditMode ? "Update SO" : "Create SO"}
    </button>
  </div>
</form>



  );
}
