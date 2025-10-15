import { useEffect, useState } from "react";
import companyAPI from "../../axios/companyAPI";

const initial = {
  code: "",
  name: "",
  address: "",
  gst_no: "",
  contact_no: "",
  email: "",
  owner_name: "",
};

export default function CompanyManage() {
  // Form state
  const [form, setForm] = useState(initial);
  const [creating, setCreating] = useState(false);

  // List state
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  // Selected/Active company
  const [selected, setSelected] = useState(localStorage.getItem("company_code") || "");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      const { data } = await companyAPI.getAll();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setMsg(null);
    setErr(null);
    try {
      const payload = {
        ...form,
        code: String(form.code || "").trim().toLowerCase(),
      };
      if (!payload.code || !payload.name) {
        setErr("Code and Name are required");
        setCreating(false);
        return;
      }
      await companyAPI.create(payload);
      localStorage.setItem("company_code", payload.code);
      setSelected(payload.code);
      setMsg(`Company created and selected: ${payload.code.toUpperCase()}`);
      setForm(initial);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Failed to create company");
    } finally {
      setCreating(false);
    }
  };

  const selectCompany = (code) => {
    const cc = String(code || "").toLowerCase();
    localStorage.setItem("company_code", cc);
    setSelected(cc);
    setMsg(`Selected company: ${cc.toUpperCase()}`);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-semibold">Companies</h1>

      {msg && <div className="rounded bg-green-100 text-green-800 px-3 py-2">{msg}</div>}
      {err && <div className="rounded bg-red-100 text-red-800 px-3 py-2">{err}</div>}

      {/* Create form */}
      <div className="border rounded p-4">
        <h2 className="font-medium mb-3">Create Company</h2>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Company Code</label>
            <input
              name="code"
              value={form.code}
              onChange={onChange}
              placeholder="e.g., c1"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Company Name"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Address</label>
            <input
              name="address"
              value={form.address}
              onChange={onChange}
              placeholder="Address"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">GST No</label>
            <input
              name="gst_no"
              value={form.gst_no}
              onChange={onChange}
              placeholder="GST Number"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Contact No</label>
            <input
              name="contact_no"
              value={form.contact_no}
              onChange={onChange}
              placeholder="Mobile number"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="email@example.com"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Owner Name</label>
            <input
              name="owner_name"
              value={form.owner_name}
              onChange={onChange}
              placeholder="Owner"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => setForm(initial)}
              className="px-4 py-2 rounded border"
              disabled={creating}
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
              disabled={creating}
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>

      {/* List + Select */}
      <div className="border rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Company List</h2>
          <button onClick={load} className="px-3 py-1 rounded border" disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-3 py-2">Code</th>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">GST</th>
                <th className="text-left px-3 py-2">Contact</th>
                <th className="text-left px-3 py-2">Owner</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading && (
                <tr>
                  <td className="px-3 py-3" colSpan={7}>No companies found</td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2 font-mono">{r.code}</td>
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2">{r.gst_no || "-"}</td>
                  <td className="px-3 py-2">{r.contact_no || "-"}</td>
                  <td className="px-3 py-2">{r.owner_name || "-"}</td>
                  <td className="px-3 py-2">{r.status || "-"}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => selectCompany(r.code)}
                      className={`px-3 py-1 rounded ${
                        selected === r.code?.toLowerCase()
                          ? "bg-green-600 text-white"
                          : "border"
                      }`}
                    >
                      {selected === r.code?.toLowerCase() ? "Selected" : "Select"}
                    </button>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td className="px-3 py-3" colSpan={7}>Loading...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-sm text-gray-600">
          Current company: <span className="font-mono">{selected || "(none)"}</span>
        </div>
      </div>
    </div>
  );
}
