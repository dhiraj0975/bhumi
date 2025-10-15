import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setEditingVendor } from "../../features/vendor/vendorSlice";
import { deleteVendor, fetchVendors, updateVendorStatus } from "../../features/vendor/vendorThunks.js";
import DataTable from "../DataTable/DataTable";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import {
  Building2, FileText, MapPin, Phone, CreditCard, Landmark, FileSignature
} from "lucide-react";

export default function VendorList() {
  const dispatch = useDispatch();
  const { vendors, loading, error } = useSelector((state) => state.vendors);
  const [viewVendor, setViewVendor] = useState(null);
  const [bankDetailsVendor, setBankDetailsVendor] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);

  const filteredVendors = useMemo(() => {
    if (!search) return vendors;
    const term = search.toLowerCase();
    return vendors.filter((v) =>
      [v.vendor_name, v.firm_name, v.gst_no, v.address, v.contact_number]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(term))
    );
  }, [vendors, search]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredVendors.length / PAGE_SIZE));
  }, [filteredVendors]);

  const currentPageVendors = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredVendors.slice(start, start + PAGE_SIZE);
  }, [filteredVendors, page]);

const handleEdit = (vendor) => {
  dispatch(setEditingVendor(vendor));
  try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch { 
    document.body.scrollTop = 0;
  }
};


  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      dispatch(deleteVendor(id));
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const normalizedCurrentStatus = (currentStatus || "").toString().toLowerCase();
    const newStatus = normalizedCurrentStatus === 'active' ? 'inactive' : 'active';
    await dispatch(updateVendorStatus({ id, status: newStatus }));
    dispatch(fetchVendors());
  };

  const totalVendors = vendors.length;
  const activeVendors = vendors.filter((v) => (v.status || "").toString().toLowerCase() === "active").length;
  const inactiveVendors = totalVendors - activeVendors;

  const columns = [
    {
      field: "sl_no",
      headerName: "Sl.No.",
      width: 80,
      sortable: false,
      renderCell: (params) => {
        const pageStart = (page - 1) * PAGE_SIZE;
        const rowIndex = currentPageVendors.findIndex(vendor => vendor.id === params.row.id);
        return pageStart + rowIndex + 1;
      }
    },
    { field: "vendor_name", headerName: "Vendor Name", flex: 1 },
    { field: "firm_name", headerName: "Firm Name", flex: 1 },
    { field: "gst_no", headerName: "GST No", flex: 1 },
    { field: "address", headerName: "Address", flex: 1 },
    { field: "contact_number", headerName: "Contact", flex: 1 },

    // ADDED: Balance with conditional red text if below threshold
    {
      field: "balance",
      headerName: "Balance",
      width: 140,
      renderCell: (params) => {
        const bal = Number(params.row.balance ?? 0);
        const min = Number(params.row.min_balance ?? 5000);
        const low = bal < min;
        return (
          <span className={`${low ? "text-gray-800 font-semibold" : " text-red-600 font-semibold"}`}>
            {bal.toFixed(2)}
          </span>
        );
      },
    },

   // ADDED: Min Balance column
    {
      field: "min_balance",
      headerName: "Min Balance",
      width: 140,
      renderCell: (params) => {
        const min = Number(params.row.min_balance ?? 5000);
        return <span className="text-gray-800">{min.toFixed(2)}</span>;
      },
    },

    {
      field: "status",
      headerName: "Status",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <div
          onClick={() => handleStatusToggle(params.row.id, params.value)}
          className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-all duration-300 shadow-md ${
            (params.value || "").toString().toLowerCase() === 'active'
              ? 'bg-green-500'
              : 'bg-gray-300'
          }`}
          title={`Click to ${(params.value || "").toString().toLowerCase() === 'active' ? 'deactivate' : 'activate'}`}
        >
          <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 shadow-lg border border-gray-200 ${
              (params.value || "").toString().toLowerCase() === 'active'
                ? 'translate-x-6'
                : 'translate-x-1'
            }`}
          />
        </div>
      )
    },
    {
      field: "bank",
      headerName: "Bank",
      sortable: false,
      width: 80,
      renderCell: (params) => (
        <IconButton
          color="info"
          onClick={() => setBankDetailsVendor(params.row)}
          title="View Bank Details"
        >
          <AccountBalanceIcon />
        </IconButton>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      width: 120,
      renderCell: (params) => (
        <div className="flex gap-2">
          <IconButton color="primary" onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Vendors</h2>

      {loading && <p className="text-gray-600">Loading vendors...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-100 via-blue-200 to-blue-50 rounded-lg shadow p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-blue-900">Total Vendors</p>
            <Building2 size={18} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-2">{totalVendors}</p>
        </div>
        <div className="bg-gradient-to-br from-green-100 via-green-200 to-green-50 rounded-lg shadow p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-green-900">Active</p>
            <span className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-900 mt-2">{activeVendors}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-100 via-gray-200 to-gray-50 rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">Inactive</p>
            <span className="w-3 h-3 rounded-full bg-gray-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{inactiveVendors}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search by firm name, GST, phone, address..."
          className="border rounded px-3 py-2 w-full max-w-md"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <div className="flex-1" />
      </div>

      {/* DataGrid */}
      <div className="bg-white rounded shadow overflow-x-auto mb-6">
        <DataTable
          rows={vendors}
          columns={columns}
          pageSize={10}
          checkboxSelection={true}
          title="Vendors List"
          getRowId={(row) => row?.id ?? row?.vendor_id ?? row?._id}
        />
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >Next</button>
      </div>

      {/* Bank Details Modal */}
{bankDetailsVendor && (
  <div className="fixed inset-0 z-50">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onClick={() => setBankDetailsVendor(null)}
    />
    {/* Card */}
    <div className="relative h-full w-full flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <CreditCard size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Bank details</h2>
              <p className="text-xs text-gray-500">{bankDetailsVendor?.firm_name || "—"}</p>
            </div>
          </div>
          <button
            onClick={() => setBankDetailsVendor(null)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {(() => {
            const bank = {
              pan_number: bankDetailsVendor?.pan_number || "",
              account_holder_name: bankDetailsVendor?.account_holder_name || "",
              bank_name: bankDetailsVendor?.bank_name || "",
              account_number: bankDetailsVendor?.account_number || "",
              ifsc_code: bankDetailsVendor?.ifsc_code || "",
              branch_name: bankDetailsVendor?.branch_name || ""
            };

            const Item = ({ label, value, icon, isCopy }) => (
              <div className="group border rounded-xl p-3.5 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-gray-600">{icon}</span>
                  <p className="text-xs font-medium text-gray-600">{label}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className={`text-sm ${value ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
                    {value || "Not available"}
                  </p>
                  {isCopy && value ? (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(value);
                        } catch {}
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                    >
                      Copy
                    </button>
                  ) : null}
                </div>
              </div>
            );

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Item label="PAN number" value={bank.pan_number} icon={<FileSignature size={16} />} isCopy />
                <Item label="Account holder" value={bank.account_holder_name} icon={<Building2 size={16} />} />
                <Item label="Bank name" value={bank.bank_name} icon={<Landmark size={16} />} />
                <Item label="Account number" value={bank.account_number} icon={<CreditCard size={16} />} isCopy />
                <Item label="IFSC code" value={bank.ifsc_code} icon={<FileText size={16} />} isCopy />
                <Item label="Branch name" value={bank.branch_name} icon={<MapPin size={16} />} />
              </div>
            );
          })()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end">
          <button
            onClick={() => setBankDetailsVendor(null)}
            className="px-5 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}


      {/* View Modal */}
      {viewVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Vendor Details</h2>
              <button onClick={() => setViewVendor(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            {(() => {
              const row = viewVendor;
              const bank = {
                pan_number: row.pan_number || "",
                account_holder_name: row.account_holder_name || "",
                bank_name: row.bank_name || "",
                account_number: row.account_number || "",
                ifsc_code: row.ifsc_code || "",
                branch_name: row.branch_name || ""
              };
              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-xl border bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                      <Building2 size={16} /> Vendor Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Vendor Name</p>
                        <p className="font-medium">{row.vendor_name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Firm Name</p>
                        <p className="font-medium">{row.firm_name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">GST No</p>
                        <p className="font-medium">{row.gst_no || "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Contact</p>
                        <p className="font-medium flex items-center gap-2"><Phone size={14} /> {row.contact_number || "-"}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-gray-500">Address</p>
                        <p className="font-medium flex items-center gap-2"><MapPin size={14} /> {row.address || "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Balance</p>
                        <p className={`${Number(row.balance ?? 0) < Number(row.min_balance ?? 5000) ? " text-gray-800 font-semibold" : "text-red-600 font-semibold"}`}>
                          {Number(row.balance ?? 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Min Balance</p>
                        <p className="text-gray-800">{Number(row.min_balance ?? 5000).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-purple-700 mb-4 flex items-center gap-2">
                      <CreditCard size={18} /> Bank Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <FileSignature size={16} className="text-purple-600" />
                          <p className="text-sm font-semibold text-purple-800">PAN Number</p>
                        </div>
                        <p className="text-base font-bold text-purple-900">{bank.pan_number || "Not Available"}</p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 size={16} className="text-green-600" />
                          <p className="text-sm font-semibold text-green-800">Account Holder</p>
                        </div>
                        <p className="text-base font-bold text-green-900">{bank.account_holder_name || "Not Available"}</p>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Landmark size={16} className="text-blue-600" />
                          <p className="text-sm font-semibold text-blue-800">Bank Name</p>
                        </div>
                        <p className="text-base font-bold text-blue-900">{bank.bank_name || "Not Available"}</p>
                      </div>

                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard size={16} className="text-orange-600" />
                          <p className="text-sm font-semibold text-orange-800">Account Number</p>
                        </div>
                        <p className="text-base font-bold text-orange-900">{bank.account_number || "Not Available"}</p>
                      </div>

                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText size={16} className="text-indigo-600" />
                          <p className="text-sm font-semibold text-indigo-800">IFSC Code</p>
                        </div>
                        <p className="text-base font-bold text-indigo-900">{bank.ifsc_code || "Not Available"}</p>
                      </div>

                      <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 border border-teal-200">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin size={16} className="text-teal-600" />
                          <p className="text-sm font-semibold text-teal-800">Branch Name</p>
                        </div>
                        <p className="text-base font-bold text-teal-900">{bank.branch_name || "Not Available"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
