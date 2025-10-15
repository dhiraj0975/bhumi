// src/components/common/DataTable.jsx
import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button, TextField } from "@mui/material";
import { Download, Search } from "@mui/icons-material";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function DataTable({
  rows = [],
  columns = [],
  pageSize = 5,
  checkboxSelection = false,
  title = "Data List",
  getRowId = (row) => row.id, // ✅ id handle
}) {
  const [searchText, setSearchText] = useState("");

  // ✅ Filter rows by search
  const filteredRows = rows.filter((row) =>
    Object.values(row)
      .join(" ")
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  // ✅ Export Excel
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${title}.xlsx`);
  };

  // ✅ Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(title, 20, 10);
    const tableColumn = columns.map((col) => col.headerName);
    const tableRows = filteredRows.map((row) =>
      columns.map((col) => row[col.field])
    );
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
    });
    doc.save(`${title}.pdf`);
  };

  return (
    <div className="w-full bg-white shadow-lg rounded-xl p-4">
      {/* Top bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <Search fontSize="small" className="mr-2 text-gray-500" />
            ),
          }}
        />
        <div className="flex gap-2">
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={handleExportExcel}
          >
            Export Excel
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={handleExportPDF}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* DataGrid */}
      <div className="h-[500px]">
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 20]}
          checkboxSelection={checkboxSelection}
          disableSelectionOnClick
          getRowId={getRowId} // ✅ Safe id
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f3f4f6",
              fontWeight: "bold",
              fontSize: "16px",
            },
            "& .MuiDataGrid-cell": {
              fontSize: "14px",
            },
          }}
        />
      </div>
    </div>
  );
}
