// src/pages/customers/CustomersPage.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import customersAPI from "../../axios/customerAPI";
import { toast } from "react-toastify";

// Money formatter
const inr = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(num);
};

// Inline Toggle
function Toggle({ checked = false, onChange, disabled = false, size = "md" }) {
  const sizes = {
    sm: { track: "h-5 w-10", thumb: "h-4 w-4", on: "translate-x-5", off: "translate-x-1" },
    md: { track: "h-6 w-12", thumb: "h-5 w-5", on: "translate-x-6", off: "translate-x-1" },
    lg: { track: "h-7 w-14", thumb: "h-6 w-6", on: "translate-x-7", off: "translate-x-1" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange?.(!checked)}
      className={[
        "relative inline-flex items-center rounded-full transition-colors focus:outline-none shadow-inner",
        checked ? "bg-emerald-500" : "bg-gray-300",
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
        s.track,
      ].join(" ")}
      aria-pressed={checked}
      aria-label="Toggle status"
    >
      <span
        className={[
          "inline-block transform rounded-full bg-white shadow transition-transform",
          s.thumb,
          checked ? s.on : s.off,
        ].join(" ")}
      />
    </button>
  );
}

// Form model (updated for gst_no; removed GST%)
const emptyForm = {
  name: "", email: "", phone: "", address: "", status: "Active",
  gst_no: "", balance: 0, min_balance: 5000,
};

// Escape key hook for modal
function useEscape(handler) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") handler?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handler]);
}

// GSTIN regex (optional)
const isValidGSTIN = (s) =>
  !s || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(String(s).toUpperCase());

export default function CustomersPage() {
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Statement modal state
  const [showStatement, setShowStatement] = useState(false);
  const [statementRows, setStatementRows] = useState([]);
  const [statementTotals, setStatementTotals] = useState(null);
  const [statementLoading, setStatementLoading] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [stFrom, setStFrom] = useState(() => {
    const d = new Date(Date.now() - 30 * 24 * 3600 * 1000);
    return d.toISOString().slice(0, 10);
  });
  const [stTo, setStTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [stPage, setStPage] = useState(1);
  const [stLimit, setStLimit] = useState(50);
  const [stSort, setStSort] = useState("asc");

  // Close modal on Escape
  useEscape(() => setShowStatement(false));

  // Search: exclude min_balance from filter; include gst_no
  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim();
    if (!term) return rows;
    return rows.filter((r) =>
      [r.name, r.email, r.phone, r.address, r.status, r.balance, r.gst_no]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [rows, q]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data } = await customersAPI.getAll();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e?.message || "Failed to load customers";
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

const validate = () => {
  const gst = (form.gst_no || "").toUpperCase().trim();
  if (!form.name.trim()) return "Name is required";
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return "Invalid email";
  if (form.phone && !/^\d{7,15}$/.test(form.phone)) return "Invalid phone";
  if (form.balance !== "" && Number(form.balance) < 0) return "Balance cannot be negative";
  if (form.min_balance !== "" && Number(form.min_balance) < 0) return "Min balance cannot be negative";
 
  return "";
};


  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setErr(v);
      toast.error(v);
      return;
    }
    setErr("");
    setLoading(true);
    try {
const payload = {
  name: form.name,
  email: form.email || "",
  phone: form.phone || "",
  address: form.address || "",
  status: form.status || "Active",
  gst_no: (form.gst_no || "").toUpperCase().trim() || "",
  balance: Number(form.balance || 0),
  min_balance: Number(form.min_balance || 5000),
};

      if (editId) {
        await customersAPI.update(editId, payload);
        toast.success("Customer updated");
      } else {
        const res = await customersAPI.create(payload);
        toast.success(res?.status === 201 ? "Customer created" : "Customer created");
      }
      await fetchAll();
      onReset();
      setShowForm(false);
    } catch (e2) {
      const msg = e2?.message || e2?.response?.data?.message || "Request failed";
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const openCreate = () => {
    onReset();
    setShowForm(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  };

  const onEdit = (row) => {
    setEditId(row.id);
    setForm({
      name: row.name || "",
      email: row.email || "",
      phone: row.phone || "",
      address: row.address || "",
      status: row.status || "Active",
      gst_no: row.gst_no || row.GST_No || "",
      balance: Number(row.balance ?? 0),
      min_balance: Number(row.min_balance ?? 5000),
    });
    setShowForm(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this customer?")) return;
    setLoading(true);
    try {
      await customersAPI.remove(id);
      toast.success("Customer deleted");
      await fetchAll();
      if (editId === id) onReset();
    } catch (e) {
      toast.error(e?.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const onToggleOptimistic = async (row) => {
    const wasActive = String(row.status).toLowerCase() === "active";
    setRows((list) =>
      list.map((x) => (x.id === row.id ? { ...x, status: wasActive ? "Inactive" : "Active" } : x))
    );
    try {
      await customersAPI.toggleStatus(row.id, row.status);
      toast.success(`Status set to ${wasActive ? "Inactive" : "Active"}`);
    } catch (e) {
      setRows((list) => list.map((x) => (x.id === row.id ? { ...x, status: row.status } : x)));
      toast.error(e?.message || "Failed to toggle status");
    }
  };

  // Statement fetcher
  const fetchStatement = useCallback(async (id, from, to, page, limit, sort) => {
    try {
      setStatementLoading(true);
      const [{ data: st }, { data: sum }] = await Promise.all([
        customersAPI.getStatement(id, { from, to, page, limit, sort }),
        customersAPI.getSummary(id, { as_of: to }),
      ]);
      setStatementRows(Array.isArray(st?.rows) ? st.rows : []);
      setStatementTotals(st?.totals ? { ...st.totals, ...sum } : sum || null);
    } catch (e) {
      toast.error(e?.message || "Failed to load statement");
    } finally {
      setStatementLoading(false);
    }
  }, []);

  const openStatement = (row) => {
    setActiveCustomer(row);
    setShowStatement(true);
    setStPage(1);
    void fetchStatement(row.id, stFrom, stTo, 1, stLimit, stSort);
  };

  // File download helpers for CSV/PDF that respect CORS and filename
  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = async () => {
    if (!activeCustomer) return;
    try {
      const { data } = await customersAPI.exportStatementCSV(activeCustomer.id, { from: stFrom, to: stTo, sort: stSort });
      downloadBlob(data, `customer_${activeCustomer.id}_statement.csv`);
    } catch (e) {
      toast.error(e?.message || "CSV export failed");
    }
  };

  const exportPDF = async () => {
    if (!activeCustomer) return;
    try {
      const { data } = await customersAPI.exportStatementPDF(activeCustomer.id, { from: stFrom, to: stTo, sort: stSort });
      downloadBlob(data, `customer_${activeCustomer.id}_statement.pdf`);
    } catch (e) {
      toast.error(e?.message || "PDF export failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex rounded-md items-center justify-between mb-4 bg-white shadow-md p-3">
        <h2 className="text-xl font-bold">Customer Management</h2>
        <button
          type="button"
          onClick={() => (showForm ? setShowForm(false) : openCreate())}
          className={`px-4 py-2 rounded-lg text-white ${showForm ? "bg-gray-600" : "bg-green-600"}`}
          title={showForm ? "Close form" : "Add new customer"}
        >
          {showForm ? "Close Form" : "+ Add Customer"}
        </button>
      </div>

      {err && <div className="mb-3 text-red-600">{err}</div>}

      {showForm && (
        <form onSubmit={onSubmit} className="bg-white shadow-lg rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editId ? "Update Customer" : "Register Customer"}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="cust_name" className="text-sm text-gray-600 mb-1">Name</label>
              <input
                id="cust_name"
                type="text"
                placeholder="Full name"
                className="border p-2 rounded-lg"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="cust_email" className="text-sm text-gray-600 mb-1">Email</label>
              <input
                id="cust_email"
                type="email"
                placeholder="example@domain.com"
                className="border p-2 rounded-lg"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="cust_phone" className="text-sm text-gray-600 mb-1">Phone</label>
              <input
                id="cust_phone"
                type="text"
                placeholder="Phone number"
                className="border p-2 rounded-lg"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="cust_address" className="text-sm text-gray-600 mb-1">Address</label>
              <input
                id="cust_address"
                type="text"
                placeholder="Street, City, State"
                className="border p-2 rounded-lg"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="cust_gst_no" className="text-sm text-gray-600 mb-1">GST No.</label>
              <input
                id="cust_gst_no"
                type="text"
                placeholder="15-char GSTIN (optional)"
                className="border p-2 rounded-lg uppercase"
                value={form.gst_no}
                onChange={(e) => setForm({ ...form, gst_no: e.target.value.toUpperCase() })}
                maxLength={15}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="cust_balance" className="text-sm text-gray-600 mb-1">Balance (₹)</label>
              <input
                id="cust_balance"
                type="number"
                step="0.01"
                className="border p-2 rounded-lg"
                value={form.balance}
                onChange={(e) => setForm({ ...form, balance: e.target.value })}
              />
            </div>

            {/* Min Balance stays only in form */}
            <div className="flex flex-col">
              <label htmlFor="cust_min_balance" className="text-sm text-gray-600 mb-1">Min Balance (₹)</label>
              <input
                id="cust_min_balance"
                type="number"
                step="0.01"
                className="border p-2 rounded-lg"
                value={form.min_balance}
                onChange={(e) => setForm({ ...form, min_balance: e.target.value })}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="cust_status" className="text-sm text-gray-600 mb-1">Status</label>
              <select
                id="cust_status"
                className="border p-2 rounded-lg"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60"
            >
              {editId ? "Update" : "Register"}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Reset
            </button>
          </div>
        </form>
      )}

      {/* List + Search */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Customers</h3>
          <input
            className="border p-2 rounded-lg w-60"
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Sl.No.</th>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Phone</th>
                  <th className="p-2 border">Address</th>
                  <th className="p-2 border">GST No.</th>
                  <th className="p-2 border">Balance</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Created At</th>
                  <th className="p-2 border">Updated At</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => {
                  const bal = Number(r.balance ?? 0);
                  const isNeg = bal < 0;
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="p-2 border">{idx + 1}</td>
                      <td className="p-2 border">
                        <button
                          type="button"
                          onClick={() => openStatement(r)}
                          className="text-blue-600 underline hover:text-blue-800"
                          title="View transactions"
                        >
                          {r.name}
                        </button>
                      </td>
                      <td className="p-2 border">{r.email}</td>
                      <td className="p-2 border">{r.phone}</td>
                      <td className="p-2 border">{r.address}</td>
                      <td className="p-2 border">{r.gst_no || r.GST_No || "-"}</td>
                      <td className={`p-2 border ${isNeg ? "text-red-600 font-semibold" : "text-gray-800"}`}>
                        {inr(bal)}
                      </td>
                      <td className="p-2 border">
                        <Toggle
                          checked={String(r.status).toLowerCase() === "active"}
                          onChange={() => onToggleOptimistic(r)}
                          size="md"
                        />
                      </td>
                      <td className="p-2 border">{r.created_at_formatted || r.created_at}</td>
                      <td className="p-2 border">{r.updated_at_formatted || r.updated_at}</td>
                      <td className="p-2 border">
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => onEdit(r)}>
                            Edit
                          </button>
                          <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => onDelete(r.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!filtered.length && (
                  <tr>
                    <td className="p-4 text-center" colSpan={11}>No customers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statement Modal (transactions + CSV/PDF) */}
      {showStatement && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
          onClick={() => setShowStatement(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-[1000px] max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b bg-white/60 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center shadow-sm">
                    <span className="text-sm font-semibold">
                      {(activeCustomer?.name || 'C').substring(0,1).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold tracking-tight">{activeCustomer?.name}</h3>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Customer Statement
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Range: {stFrom} → {stTo} · Sort: {stSort === 'asc' ? 'Oldest → Newest' : 'Newest → Oldest'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 transition-colors shadow-sm"
                    onClick={exportCSV}
                    title="Download CSV"
                  >
                    CSV
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white hover:from-purple-700 hover:to-fuchsia-700 active:from-purple-800 active:to-fuchsia-800 transition-colors shadow-md"
                    onClick={exportPDF}
                    title="Download PDF"
                  >
                    PDF
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 transition-colors"
                    onClick={() => setShowStatement(false)}
                    title="Close"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-b flex gap-3 items-end">
              <div>
                <label className="text-xs text-gray-600">From</label>
                <input type="date" className="border p-2 rounded w-44"
                  value={stFrom}
                  onChange={(e)=> setStFrom(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-600">To</label>
                <input type="date" className="border p-2 rounded w-44"
                  value={stTo}
                  onChange={(e)=> setStTo(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-600">Sort</label>
                <select className="border p-2 rounded"
                  value={stSort}
                  onChange={(e)=> setStSort(e.target.value)}>
                  <option value="asc">Oldest → Newest</option>
                  <option value="desc">Newest → Oldest</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600">Page size</label>
                <select className="border p-2 rounded"
                  value={stLimit}
                  onChange={(e)=> setStLimit(Number(e.target.value))}>
                  <option>25</option><option>50</option><option>100</option>
                </select>
              </div>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white"
                disabled={statementLoading || !activeCustomer}
                onClick={()=> {
                  setStPage(1);
                  if (activeCustomer) fetchStatement(activeCustomer.id, stFrom, stTo, 1, stLimit, stSort);
                }}
              >
                Apply
              </button>
            </div>

            <div className="px-5 py-3 grid grid-cols-5 gap-3 border-b bg-gray-50">
              <div className="p-3 rounded bg-white shadow-sm">
                <div className="text-xs text-gray-500">Opening Balance</div>
                <div className="font-semibold">{inr(statementTotals?.opening_balance || 0)}</div>
              </div>
              <div className="p-3 rounded bg-white shadow-sm">
                <div className="text-xs text-gray-500">Total Invoiced</div>
                <div className="font-semibold">{inr(statementTotals?.total_invoiced || 0)}</div>
              </div>
              <div className="p-3 rounded bg-white shadow-sm">
                <div className="text-xs text-gray-500">Total Paid</div>
                <div className="font-semibold">{inr(statementTotals?.total_paid || 0)}</div>
              </div>
              <div className="p-3 rounded bg-white shadow-sm">
                <div className="text-xs text-gray-500">Outstanding (as of To)</div>
                <div className="font-semibold">
                  {inr(statementTotals?.outstanding_as_of || statementTotals?.outstanding_as_of_to || 0)}
                </div>
              </div>
              <div className="p-3 rounded bg-white shadow-sm">
                <div className="text-xs text-gray-500">Payments Count</div>
                <div className="font-semibold">{Number(statementTotals?.payment_count || statementTotals?.payment_count_upto || 0)}</div>
              </div>
            </div>

            <div className="p-5 overflow-auto max-h-[50vh]">
              {statementLoading ? (
                <div>Loading...</div>
              ) : (
                <table className="min-w-full border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Date/Time</th>
                      <th className="p-2 border">Type</th>
                      <th className="p-2 border">Ref No</th>
                      <th className="p-2 border">Amount</th>
                      <th className="p-2 border">Net Effect</th>
                      <th className="p-2 border">Running Balance</th>
                      <th className="p-2 border">Method</th>
                      <th className="p-2 border">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statementRows.map((r,i)=> (
                      <tr key={`${r.ref_no}-${i}`} className="hover:bg-gray-50">
                        <td className="p-2 border">{r.tx_datetime}</td>
                        <td className="p-2 border">{r.tx_type}</td>
                        <td className="p-2 border">{r.ref_no}</td>
                        <td className="p-2 border">{inr(r.amount)}</td>
                        <td className="p-2 border">{inr(r.net_effect)}</td>
                        <td className="p-2 border">{inr(r.running_balance)}</td>
                        <td className="p-2 border">{r.payment_method || '-'}</td>
                        <td className="p-2 border">{r.note || '-'}</td>
                      </tr>
                    ))}
                    {!statementRows.length && (
                      <tr><td className="p-4 text-center" colSpan={8}>No transactions</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="px-5 py-3 border-t flex items-center justify-between">
              <div className="text-sm text-gray-600">Page {stPage}</div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
                  disabled={stPage<=1 || statementLoading}
                  onClick={()=> {
                    const p = Math.max(1, stPage-1);
                    setStPage(p);
                    if (activeCustomer) fetchStatement(activeCustomer.id, stFrom, stTo, p, stLimit, stSort);
                  }}
                >Prev</button>
                <button
                  className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
                  disabled={statementRows.length < stLimit || statementLoading}
                  onClick={()=> {
                    const p = stPage+1;
                    setStPage(p);
                    if (activeCustomer) fetchStatement(activeCustomer.id, stFrom, stTo, p, stLimit, stSort);
                  }}
                >Next</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
