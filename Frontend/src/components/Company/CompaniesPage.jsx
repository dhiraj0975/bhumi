import { useEffect, useMemo, useState } from "react";
import companyAPI from "../../axios/companyAPI";
import { toast } from "react-toastify";

const emptyForm = {
  code: "",
  name: "",
  address: "",
  gst_no: "",
  contact_no: "",
  email: "",
  owner_name: "",
  status: "Active",
};

export default function CompaniesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [selected, setSelected] = useState(localStorage.getItem("company_code") || "");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data } = await companyAPI.getAll();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e?.response?.data?.error || e.message || "Failed to load companies";
      setRows([]);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchAll(); }, []);

  const filtered = useMemo(() => {
    const term = (q || "").toLowerCase().trim();
    if (!term) return rows;
    return rows.filter((r) => [r.code, r.name, r.gst_no, r.contact_no, r.owner_name, r.status]
      .filter(Boolean).some((v) => String(v).toLowerCase().includes(term)));
  }, [rows, q]);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.code.trim()) return "Code is required";
    if (!form.name.trim()) return "Name is required";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { toast.error(v); return; }
    setLoading(true);
    try {
      const payload = { ...form, code: String(form.code || "").trim().toLowerCase() };
      if (editId) {
        // Company update endpoint not implemented, fallback to create for now
        await companyAPI.create(payload);
        toast.success("Company updated");
      } else {
        await companyAPI.create(payload);
        toast.success("Company created");
      }
      localStorage.setItem("company_code", payload.code);
      setSelected(payload.code);
      setForm(emptyForm);
      setShowForm(false);
      await fetchAll();
    } catch (e) {
      const msg = e?.response?.data?.error || e.message || "Request failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (row) => {
    setEditId(row.id);
    setForm({
      code: row.code || "",
      name: row.name || "",
      address: row.address || "",
      gst_no: row.gst_no || "",
      contact_no: row.contact_no || "",
      email: row.email || "",
      owner_name: row.owner_name || "",
      status: row.status || "Active",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this company?")) return;
    setLoading(true);
    try {
      // Not implementing delete API; just simulate
      toast.info("Delete not implemented on server");
    } catch (e) {
      toast.error(e?.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const onSelect = (code) => {
    const cc = String(code || "").toLowerCase();
    localStorage.setItem("company_code", cc);
    setSelected(cc);
    toast.success(`Selected company ${cc.toUpperCase()}`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex rounded-md items-center justify-between mb-4 bg-white shadow-md p-3">
        <h2 className="text-xl font-bold">Companies</h2>
        <button
          type="button"
          onClick={() => (showForm ? setShowForm(false) : setShowForm(true))}
          className={`px-4 py-2 rounded-lg text-white ${showForm ? "bg-gray-600" : "bg-green-600"}`}
          title={showForm ? "Close form" : "Add new company"}
        >
          {showForm ? "Close Form" : "+ Add Company"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="bg-white shadow-lg rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{editId ? "Update Company" : "Create Company"}</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Company Code</label>
              <input name="code" className="border p-2 rounded-lg" value={form.code} onChange={onChange} required />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Name</label>
              <input name="name" className="border p-2 rounded-lg" value={form.name} onChange={onChange} required />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">GST No</label>
              <input name="gst_no" className="border p-2 rounded-lg" value={form.gst_no} onChange={onChange} />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Contact</label>
              <input name="contact_no" className="border p-2 rounded-lg" value={form.contact_no} onChange={onChange} />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm text-gray-600 mb-1">Address</label>
              <input name="address" className="border p-2 rounded-lg" value={form.address} onChange={onChange} />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Owner</label>
              <input name="owner_name" className="border p-2 rounded-lg" value={form.owner_name} onChange={onChange} />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Email</label>
              <input name="email" className="border p-2 rounded-lg" value={form.email} onChange={onChange} />
            </div>

            <div className="flex items-center gap-2 md:col-span-2 mt-2 justify-end">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">{editId?"Update":"Create"}</button>
              <button type="button" className="px-4 py-2 bg-gray-200 rounded-lg" onClick={() => { setForm(emptyForm); setEditId(null); }}>Reset</button>
            </div>
          </div>
        </form>
      )}

      <div className="bg-white shadow-lg rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Companies</h3>
          <input className="border p-2 rounded-lg w-60" placeholder="Search..." value={q} onChange={(e)=> setQ(e.target.value)} />
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Sl.No.</th>
                  <th className="p-2 border">Company Code</th>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">GST No.</th>
                  <th className="p-2 border">Contact</th>
                  <th className="p-2 border">Owner</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-gray-50 text-center">
                    <td className="p-2 border">{idx+1}</td>
                    <td className="p-2 border font-mono">{r.code}</td>
                    <td className="p-2 border">{r.name}</td>
                    <td className="p-2 border">{r.gst_no || '-'}</td>
                    <td className="p-2 border">{r.contact_no || '-'}</td>
                    <td className="p-2 border">{r.owner_name || '-'}</td>
                    <td className="p-2 border">{r.status || '-'}</td>
                    <td className="p-2 border">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={()=> onEdit(r)}>Edit</button>
                        {/* <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={()=> onDelete(r.id)}>Delete</button> */}
                        <button className={`px-3 py-1 rounded ${selected === r.code?.toLowerCase() ? 'bg-green-600 text-white':'border'}`} onClick={()=> onSelect(r.code)}>{selected === r.code?.toLowerCase() ? 'Selected' : 'Select'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr><td className="p-4 text-center" colSpan={8}>No companies found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-3 text-sm text-gray-600">Current company: <span className="font-mono">{selected || '(none)'}</span></div>
    </div>
  );
}
