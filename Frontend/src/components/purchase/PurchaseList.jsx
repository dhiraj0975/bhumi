import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "../DataTable/DataTable";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { fetchPurchases } from "../../features/purchase/purchaseSlice";
import PurchaseDetailsPanel from "./PurchaseDetailsPanel";

const fx = (n) => (isNaN(n) ? "0.000" : Number(n).toFixed(3));

export default function PurchaseList({ reload }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: purchases = [] } = useSelector((state) => state.purchases || {});

  const [viewPurchaseId, setViewPurchaseId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    dispatch(fetchPurchases());
  }, [dispatch, reload]);

  useEffect(() => {
    if (!viewPurchaseId) return;
    const onKey = (e) => {
      if (e.key === "Escape") setViewPurchaseId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewPurchaseId]);

  // CHANGED: search me party_name include
  const filtered = useMemo(() => {
    if (!search) return purchases;
    const term = search.toLowerCase();
    return purchases.filter((p) =>
      [p.bill_no, p.party_name, p.gst_no, p.total_amount]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [purchases, search]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)), [filtered]);
  const currentPageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPurchases = purchases.length;
  const totalAmount = purchases.reduce((s, p) => s + Number(p.total_amount || 0), 0);

  // CHANGED: Vendor -> Party column; optional party_type badge
  const columns = [
    {
      field: "sl_no",
      headerName: "Sl.No.",
      width: 80,
      sortable: false,
      renderCell: (params) => {
        const pageStart = (page - 1) * PAGE_SIZE;
        const rowIndex = currentPageRows.findIndex((r) => r.id === params.row.id);
        return pageStart + rowIndex + 1;
      },
    },
    {
      field: "bill_no",
      headerName: "Bill No",
      flex: 1,
      renderCell: (params) => (
        <button
          type="button"
          onClick={() => setViewPurchaseId(params.row.id)}
          className="text-blue-600 cursor-pointer underline text-left w-full truncate"
          title={params.value}
        >
          {params.value || "-"}
        </button>
      ),
    },
    // NEW: Party column using party_name
    {
      field: "party_name",
      headerName: "Party",
      flex: 1,
      renderCell: (params) => {
        const name = params.row.party_name || params.row.vendor_name || "-";
        const type = params.row.party_type; // 'vendor' | 'farmer' (if provided by API)
        return (
          <div className="flex items-center gap-2">
            <span className="truncate">{name}</span>
            {type ? (
              <span
                className={`text-[10px] px-2 py-0.5 rounded ${
                  type === "farmer" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                }`}
              >
                {type}
              </span>
            ) : null}
          </div>
        );
      },
    },
    {
      field: "bill_date",
      headerName: "Date",
      width: 140,
      renderCell: (params) => (params.value ? new Date(params.value).toLocaleDateString() : "N/A"),
    },
    {
      field: "total_amount",
      headerName: "Total Amount",
      width: 140,
      renderCell: (params) => fx(params.value),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <div className="flex gap-2">
          <IconButton color="primary" onClick={() => setViewPurchaseId(params.row.id)} title="View">
            <VisibilityIcon />
          </IconButton>
          <IconButton color="secondary" onClick={() => navigate(`/purchases/edit/${params.row.id}`)} title="Edit">
            <EditIcon />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Purchases</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-100 via-blue-200 to-blue-50 rounded-lg shadow p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-blue-900">Total Purchases</p>
            <p className="text-sm text-blue-600">#</p>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-2">{totalPurchases}</p>
        </div>
        <div className="bg-gradient-to-br from-green-100 via-green-200 to-green-50 rounded-lg shadow p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-green-900">Total Amount</p>
            <p className="text-sm text-green-600">₹</p>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-2">{fx(totalAmount)}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-100 via-gray-200 to-gray-50 rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">Records</p>
            <p className="text-sm text-gray-600">{filtered.length}</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">Page {page}/{totalPages}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto mb-6">
        <DataTable
          rows={filtered}
          columns={columns}
          pageSize={10}
          checkboxSelection={false}
          title="Purchases List"
          getRowId={(row) => row?.id}
        />
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>

      {viewPurchaseId && <PurchaseDetailsPanel id={viewPurchaseId} onClose={() => setViewPurchaseId(null)} />}
    </div>
  );
}
