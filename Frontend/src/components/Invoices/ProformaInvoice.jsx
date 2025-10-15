import React, { useMemo } from "react";

function formatINR(n) {
  const num = Number(n || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  })
    .format(num)
    .replace("₹", "");
}

function padRows(items = [], target = 14) {
  const rows = [...items];
  while (rows.length < target) {
    rows.push({ sno: rows.length + 1, item: "", hsn: "", qty: "", rate: "", tax: "", amount: "" });
  }
  return rows;
}

const Cell = ({ children, className = "", ...rest }) => (
  <td className={`p-2 align-top text-[12px] border border-black/70 ${className}`} {...rest}>{children}</td>
);

export default function ProformaInvoice({ data }) {
  const D = useMemo(() => data || {}, [data]);

  const company = D.company || {};
  const billTo = D.billTo || {};
  const shipTo = D.shipTo || {};
  const inv = D.invoice || {};
  const itemsRaw = Array.isArray(D.items) ? D.items : [];
  const otherCharges = Array.isArray(D.otherCharges) ? D.otherCharges : [];
  const totals = D.totals || {};
  const roundOff = Number(D.roundOff || 0);

  // For predictable print height, optionally pad
  const items = useMemo(() => padRows(itemsRaw, 14), [itemsRaw]);

  return (
    <div className="invoice-wrapper mx-auto max-w-[900px] p-4 bg-white text-black">
      {/* Screen toolbar */}
      <div className="mb-4 flex justify-end gap-2 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-lg border shadow-sm hover:shadow focus:outline-none"
        >
          Print
        </button>
      </div>

      {/* A4 Sheet */}
      <div className="sheet bg-white text-[12px] leading-tight mx-auto border border-black/70 print:border-0">
        {/* HEADER */}
        <div className="p-4 border-b border-black/70 flex justify-between">
          <div>
            <h1 className="text-[18px] font-semibold uppercase">{company.name || "-"}</h1>
            <p>{company.addressLine1 || ""}</p>
            <p>{company.addressLine2 || ""}</p>
            <p>GSTIN: {company.gstin || "-"} | Mobile: {company.mobile || "-"}</p>
            <p>PAN: {company.pan || "-"} | Payment: {D.paymentDetails || "-"}</p>
          </div>
          <div className="text-right">
            <div className="text-[20px] font-bold">{inv.title || "PROFORMA INVOICE"}</div>
            <div className="mt-2 border border-black/70 inline-block">
              <div className="flex border-b border-black/70">
                <div className="px-2 py-1 border-r border-black/70">{inv.numberLabel || "Proforma Invoice No."}</div>
                <div className="px-2 py-1">{inv.number || "-"}</div>
              </div>
              <div className="flex">
                <div className="px-2 py-1 border-r border-black/70">{inv.dateLabel || "Proforma Date"}</div>
                <div className="px-2 py-1">{inv.date || "-"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* BILL/SHIP */}
        <div className="p-4 border-b border-black/70 grid grid-cols-2 gap-4">
          <div className="border border-black/70 p-2">
            <div className="font-semibold border-b border-black/70 mb-1">BILL TO</div>
            <div>{billTo.name || "-"}</div>
            <div>{billTo.address || "-"}</div>
            <div>GSTIN: {billTo.gstin || "-"} | State: {billTo.state || "-"}</div>
            <div>Mobile: {billTo.mobile || "-"} | PAN: {billTo.pan || "-"}</div>
          </div>
          <div className="border border-black/70 p-2">
            <div className="font-semibold border-b border-black/70 mb-1">SHIP TO</div>
            <div>{shipTo.name || "-"}</div>
            <div>{shipTo.address || "-"}</div>
          </div>
        </div>

        {/* ITEMS */}
        <div className="p-4 border-b border-black/70">
          <table className="w-full border-collapse print:table-fixed">
            <thead className="print:table-header-group">
              <tr className="font-semibold">
                <Cell className="text-center">S.NO.</Cell>
                <Cell>ITEMS</Cell>
                <Cell className="text-center">HSN</Cell>
                <Cell className="text-center">QTY</Cell>
                <Cell className="text-right">RATE</Cell>
                <Cell className="text-center">TAX</Cell>
                <Cell className="text-right">AMOUNT</Cell>
              </tr>
            </thead>
            <tbody className="print:table-row-group">
              {items.map((r, i) => (
                <tr key={i} className="print:break-inside-avoid">
                  <Cell className="text-center">{r.sno ?? i + 1}</Cell>
                  <Cell>{r.item || ""}</Cell>
                  <Cell className="text-center">{r.hsn || ""}</Cell>
                  <Cell className="text-center">{r.qty || ""}</Cell>
                  <Cell className="text-right">{r.rate !== "" && r.rate != null ? r.rate : ""}</Cell>
                  <Cell className="text-center">{r.tax ? `(${r.tax}%)` : ""}</Cell>
                  <Cell className="text-right">{r.amount ? formatINR(r.amount) : ""}</Cell>
                </tr>
              ))}

              {otherCharges.map((oc, idx) => (
                <tr key={`oc-${idx}`} className="font-semibold">
                  <Cell colSpan={6} className="text-right">{oc.label || "Other Charge"}</Cell>
                  <Cell className="text-right">{formatINR(oc.amount || 0)}</Cell>
                </tr>
              ))}

              {roundOff ? (
                <tr className="font-semibold">
                  <Cell colSpan={6} className="text-right">Round Off</Cell>
                  <Cell className="text-right">{formatINR(roundOff)}</Cell>
                </tr>
              ) : null}

              <tr className="font-semibold bg-gray-100">
                <Cell colSpan={6} className="text-right">Total Tax</Cell>
                <Cell className="text-right">{formatINR(totals.totalTax || 0)}</Cell>
              </tr>
              <tr className="font-semibold bg-gray-100">
                <Cell colSpan={6} className="text-right">Grand Total</Cell>
                <Cell className="text-right">{formatINR(totals.grandTotal || 0)}</Cell>
              </tr>
              <tr>
                <Cell colSpan={7} className="text-right italic">In Words: {totals.inWords || ""}</Cell>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="p-4 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="border border-black/70 p-2">
              <div className="font-semibold border-b border-black/70 mb-1">Bank Details</div>
              <div>Name: {D.bank?.name || "-"}</div>
              <div>IFSC: {D.bank?.ifsc || "-"}</div>
              <div>Account No: {D.bank?.account || "-"}</div>
              <div>Bank: {D.bank?.bankName || "-"} {D.bank?.branch ? `(${D.bank.branch})` : ""}</div>
            </div>
            <div className="border border-black/70 p-2">
              <div className="font-semibold border-b border-black/70 mb-1">Terms</div>
              <ul className="list-disc pl-4">
                {(D.terms || []).map((t, i) => (<li key={i}>{t}</li>))}
              </ul>
            </div>
          </div>
          <div className="border border-black/70 p-2 flex items-end justify-end">
            <div className="text-right">
              <div className="font-semibold">Authorised Signatory</div>
              <div>{company.name || "-"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        /* Base sheet sizing for A4 */
        .sheet {
          width: 210mm;
          min-height: 297mm;
        }
        @media screen {
          html, body { background: #f5f5f5; }
          .sheet { background: #fff; }
        }
        @media print {
          @page { size: A4; margin: 10mm; }
          html, body { background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          /* Safer isolation: hide siblings, not entire body */
          .invoice-wrapper { position: relative !important; }
          .invoice-wrapper { visibility: visible !important; }
          .invoice-wrapper * { visibility: visible !important; }
          body > *:not(.invoice-wrapper) { display: none !important; }
          /* Keep table headers repeating */
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          /* Avoid row splits */
          .print\\:break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
