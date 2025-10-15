import { useEffect, useState } from "react";
import companyAPI from "../../api/companyAPI";

export default function CompanyList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [selected, setSelected] = useState(localStorage.getItem("company_code") || "");

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

  const selectCompany = (code) => {
    const cc = String(code || "").toLowerCase();
    localStorage.setItem("company_code", cc);
    setSelected(cc);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Companies</h2>
        <button
          onClick={load}
          className="px-3 py-1 rounded border"
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {err && <div className="mb-3 rounded bg-red-100 text-red-800 px-3 py-2">{err}</div>}

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-3 py-2">Company Code</th>
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
              <tr key={r.id} className="border-t hover:bg-gray-300 text-center">
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

      <div className="mt-3 text-sm  text-gray-600">
        Current company: <span className="font-mono">{selected || "(none)"}</span>
      </div>
    </div>
  );
}
