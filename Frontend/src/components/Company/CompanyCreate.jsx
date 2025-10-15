import { useState } from "react";
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

export default function CompanyCreate() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setErr(null);
    try {
      // Trim and normalize code
      const payload = {
        ...form,
        code: String(form.code || "").trim().toLowerCase(),
      };
      if (!payload.code || !payload.name) {
        setErr("Code and Name are required");
        setLoading(false);
        return;
      }

      await companyAPI.create(payload);
      // Persist selected company
      localStorage.setItem("company_code", payload.code);
      setMsg(`Company created and selected: ${payload.code.toUpperCase()}`);
      setForm(initial);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  return ( 
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Create Company</h1>

      {msg && <div className="mb-3 rounded bg-green-100 text-green-800 px-3 py-2">{msg}</div>}
      {err && <div className="mb-3 rounded bg-red-100 text-red-800 px-3 py-2">{err}</div>}

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
            disabled={loading}
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Company"}
          </button>
        </div>
      </form>

      <div className="mt-6 text-sm text-gray-600">
        Tip: Create ke baad yeh page current company ko select bhi kar deta hai (localStorage.company_code).  
        Iske baad purchases/sales APIs wahi company ke tables par operate karenge.
      </div>
    </div>
  );
}
