import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { soApi } from "../../axios/soApi";

// helpers
const fx = (n, d = 2) => (isNaN(n) ? (0).toFixed(d) : Number(n).toFixed(d));
const fmtDate = (s) => (!s ? "-" : new Date(s).toISOString().split("T")[0]);

function InvoiceContent({ data }) {
  const { invoiceNo, date, customer, items, summary } = data || {};

  const totals = useMemo(() => {
    return {
      taxable: Number(summary?.total_taxable || 0),
      gst: Number(summary?.total_gst || 0),
      grand: Number(summary?.grand_total || 0),
    };
  }, [summary]);

  // Simple split: adjust as per intra/inter state logic if needed
  const gstSplit = useMemo(() => {
    const IGST = totals.gst || 0;
    const CGST = IGST / 2;
    const SGST = IGST / 2;
    return { IGST, CGST, SGST, useSplit: true };
  }, [totals]);

  return (
    <div className="invoice-a4 mx-auto bg-white text-black">
      {/* Header */}
      <div className="flex items-start justify-between border-b pb-3">
        <div>
          <div className="text-2xl font-semibold">Tax Invoice</div>
          <div className="text-sm text-gray-800">
            Invoice No: <span className="font-medium">{invoiceNo}</span>
          </div>
          <div className="text-sm text-gray-800">
            Date: <span className="font-medium">{fmtDate(date)}</span>
          </div>
        </div>
        <div className="text-right text-xs">
          {/* Replace with env/config values */}
          <div className="font-semibold">Bhumisha Organic</div> 
          <div>Address line 1, Bhopal City</div>
          <div>GSTIN: XXYYYYZZZZAAAA</div>
        </div>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
        <div className="border rounded p-3">
          <div className="text-gray-600">Bill To</div>
          <div className="font-medium">{customer?.name || "-"}</div>
          <div>{customer?.address || "-"}</div>
          <div>GSTIN: {customer?.gst_no || "-"}</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-gray-600">Ship To</div>
          <div className="font-medium">{customer?.name || "-"}</div>
          <div>{customer?.address || "-"}</div>
          <div>GSTIN: {customer?.gst_no || "-"}</div>
        </div>
      </div>

      {/* Items */}
      <div className="mt-5 overflow-visible">
        <table className="w-full border text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">#</th>
              <th className="border p-2 text-left">Product</th>
              <th className="border p-2 text-left">HSN</th>
              <th className="border p-2 text-right">Qty</th>
              <th className="border p-2 text-right">Rate</th>
              <th className="border p-2 text-right">Taxable</th>
              <th className="border p-2 text-right">GST%</th>
              <th className="border p-2 text-right">GST Amt</th>
              <th className="border p-2 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {(items || []).map((it, idx) => {
              const taxable = Number(it.amount || 0) - Number(it.discount_total || 0);
              return (
                <tr key={it.id || idx} className="odd:bg-white even:bg-gray-50">
                  <td className="border p-2">{idx + 1}</td>
                  <td className="border p-2 text-left">{it.product_name || String(it.product_id)}</td>
                  <td className="border p-2 text-left">{it.hsn_code || "-"}</td>
                  <td className="border p-2 text-right">{fx(it.qty)}</td>
                  <td className="border p-2 text-right">{fx(it.rate)}</td>
                  <td className="border p-2 text-right">{fx(taxable)}</td>
                  <td className="border p-2 text-right">{fx(it.gst_percent || 0)}</td>
                  <td className="border p-2 text-right">{fx(it.gst_amount || 0)}</td>
                  <td className="border p-2 text-right">{fx(it.final_amount || 0)}</td>
                </tr>
              );
            })}
            {(!items || items.length === 0) && (
              <tr>
                <td className="border p-2 text-center" colSpan={9}>No items</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-4 flex justify-end text-sm">
        <div className="w-full md:w-80 border rounded p-3">
          <div className="flex justify-between">
            <span>Taxable Amount</span>
            <span className="font-medium">{fx(totals.taxable)}</span>
          </div>
          {gstSplit.useSplit ? (
            <>
              <div className="flex justify-between">
                <span>CGST</span>
                <span className="font-medium">{fx(gstSplit.CGST)}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST</span>
                <span className="font-medium">{fx(gstSplit.SGST)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between">
              <span>IGST</span>
              <span className="font-medium">{fx(gstSplit.IGST)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Total GST</span>
            <span className="font-medium">{fx(totals.gst)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold border-t pt-2">
            <span>Grand Total</span>
            <span>{fx(totals.grand)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-xs text-gray-600">
        This is a system generated invoice and does not require a signature.
      </div>
    </div>
  );
}

export default function SalesInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await soApi.invoice(id);
      setData(res.data);
      setErr("");
    } catch (e) {
      setErr(e?.message || "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const handlePrint = () => {
    if (!data) return;
    // micro delay to ensure paint before print
    setTimeout(() => window.print(), 60);
  }; 

  return (
    <div className="p-4 print:p-0 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Actions */}
        <div className="flex items-center justify-between mb-3 no-print">
          <div className="text-lg font-semibold">Sales Invoice</div>
          <div className="space-x-2">
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => navigate("/sales-orders")}
            >
              Back
            </button>
            <button
              className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              onClick={handlePrint}
              disabled={loading || !data}
            >
              Print
            </button>
          </div>
        </div>

        {/* Content states */}
        {loading && <div className="p-6 bg-white shadow rounded">Loading invoice...</div>}
        {err && !loading && <div className="p-6 bg-white shadow rounded text-red-600">{err}</div>}

        {/* Printable area */}
        {data && (
          <div id="print-area" className="bg-white shadow rounded p-6">
            <InvoiceContent data={data} />
          </div>
        )}
      </div>

      {/* Print CSS */}
<style>{`
  @media print {
    html, body { height: auto !important; width: 99% !important; margin: 0 !important; padding: 0 !important; background: #fff !important; color: #000 !important; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
    .overflow-auto, .overflow-hidden, .overflow-y-auto, .overflow-x-auto { overflow: visible !important; }
    .shadow, .shadow-md, .shadow-lg { box-shadow: none !important; }
    #print-area { width: 210mm; min-height: 297mm; padding: 10mm 12mm; box-shadow: none !important; }
    table { border-collapse: collapse !important; }
    @page { size: A4; margin: 10mm 12mm; }
  }
`}</style>

    </div>
  );
}
