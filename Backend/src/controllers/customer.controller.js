const Customer = require('../models/customer.model.js');
const PDFDocument = require('pdfkit');

// Helpers
const safeDate = (d, fallback) => {
  const t = new Date(d);
  return isNaN(t.getTime()) ? fallback : d;
};
const toInt = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : d;
};

// GSTIN regex (India)
const isValidGSTIN = (s) => {
  if (s == null || s === "") return true; // allow empty for B2C
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(String(s).toUpperCase());
};

// Sanitizer (gst uppercased+trimmed)
const sanitizeCustomerBody = (body) => {
  const gst = typeof body.gst_no === 'string' ? body.gst_no.trim().toUpperCase() : body.gst_no ?? null;
  return {
    name: body.name,
    email: body.email ?? "",
    phone: body.phone ?? "",
    address: body.address ?? "",
    status: body.status || "Active",
    gst_no: gst || null,
    balance: body.balance,
    min_balance: body.min_balance,
  };
};

const CustomerController = {
  // List all
  getAll: (req, res) => {
    Customer.getAll((err, customers) => {
      if (err) return res.status(500).json({ message: "Failed to fetch customers" });
      res.json(customers);
    });
  },

  // By id
  getById: (req, res) => {
    const id = req.params.id;
    Customer.getById(id, (err, customer) => {
      if (err) return res.status(500).json({ message: "Failed to fetch customer" });
      if (!customer) return res.status(404).json({ message: "Customer not found" });
      res.json(customer);
    });
  },

  // Create
  create: (req, res) => {
    const { name, email } = req.body || {};
    if (!name) return res.status(400).json({ message: "Name is required" });

    // Normalize GST
    // if (typeof req.body.gst_no === 'string') {
    //   req.body.gst_no = req.body.gst_no.trim().toUpperCase();
    // }
    // // Validate GSTIN if provided
    // if (!isValidGSTIN(req.body.gst_no)) {
    //   return res.status(400).json({ message: "Invalid GST No. format (e.g., 27ABCDE1234F1Z5)" });
    // }

    const proceedCreate = () => {
      const payload = sanitizeCustomerBody(req.body);
      Customer.create(payload, (err2, customer) => {
        if (err2) return res.status(500).json({ message: "Failed to create customer" });
        res.status(201).json(customer);
      });
    };

    if (email) {
      return Customer.findByEmail(email, (err, existing) => {
        if (err) return res.status(500).json({ message: "Database error while checking email" });
        if (existing) return res.status(400).json({ message: "Email already exists" });
        proceedCreate();
      });
    }
    proceedCreate();
  },

  // Update
  update: (req, res) => {
    const id = req.params.id;
    const body = req.body || {};
    if (body.name !== undefined && !body.name) {
      return res.status(400).json({ message: "Name is required" });
    }
    // if (typeof body.gst_no === 'string') {
    //   body.gst_no = body.gst_no.trim().toUpperCase();
    // }
    // if (body.gst_no !== undefined && !isValidGSTIN(body.gst_no)) {
    //   return res.status(400).json({ message: "Invalid GST No. format (e.g., 27ABCDE1234F1Z5)" });
    // }

    const payload = sanitizeCustomerBody(body);
    Customer.update(id, payload, (err, affected) => {
      if (err) return res.status(500).json({ message: "Failed to update customer" });
      if (!affected) return res.status(404).json({ message: "Customer not found" });
      res.json({ id, ...payload });
    });
  },

  // Delete
  delete: (req, res) => {
    const id = req.params.id;
    Customer.delete(id, (err, affected) => {
      if (err) return res.status(500).json({ message: "Failed to delete customer" });
      if (!affected) return res.status(404).json({ message: "Customer not found" });
      res.json({ message: "Customer deleted successfully" });
    });
  },

  // Toggle status
  toggleStatus: (req, res) => {
    const id = req.params.id;
    const { currentStatus } = req.body || {};
    Customer.toggleStatus(id, currentStatus, (err, newStatus) => {
      if (err) return res.status(500).json({ message: "Failed to update status" });
      res.json({ id, status: newStatus });
    });
  },

  // Balance aggregate
  getBalance: (req, res) => {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: "Customer id required" });
    Customer.getBalanceAggregate(id, (err, data) => {
      if (err) return res.status(500).json({ message: "Failed to fetch balance" });
      res.json({
        customer_id: Number(id),
        previous_due: Number(data?.previous_due || 0),
        advance: Number(data?.advance || 0),
      });
    });
  },

  // Statement (JSON)
  getStatement: (req, res) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "Customer id required" });

    const now = new Date();
    const defaultTo = now.toISOString().slice(0, 10);
    const defaultFrom = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);

    const from = safeDate(req.query.from, defaultFrom);
    const to = safeDate(req.query.to, defaultTo);

    const page = toInt(req.query.page, 1);
    const limit = Math.min(toInt(req.query.limit, 50), 200);
    const offset = (page - 1) * limit;

    const sort = String(req.query.sort || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    Customer.getStatementQuery({ customerId: id, from, to, limit, offset, sort }, (err, payload) => {
      if (err) return res.status(500).json({ message: "Failed to fetch statement" });
      res.json({
        customer_id: id,
        from,
        to,
        page,
        limit,
        rows: payload.rows,
        totals: payload.totals,
      });
    });
  },

  // Summary KPIs
  getSummary: (req, res) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "Customer id required" });

    const as_of = safeDate(req.query.as_of, new Date().toISOString().slice(0, 10));

    Customer.getSummaryQuery({ customerId: id, as_of }, (err, data) => {
      if (err) return res.status(500).json({ message: "Failed to fetch summary" });
      res.json({ customer_id: id, as_of, ...data });
    });
  },

  // CSV Export
  exportStatementCSV: (req, res) => {
    const id = Number(req.params.id);
    const { from, to, sort = 'asc' } = req.query;
    const page = 1, limit = 100000, offset = 0; // export all
    const sortDir = String(sort || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    Customer.getStatementQuery({ customerId: id, from, to, limit, offset, sort: sortDir }, (err, payload) => {
      if (err) return res.status(500).send('Failed to export');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="customer_${id}_statement.csv"`);
      const rows = payload.rows || [];
      const header = ['tx_datetime','tx_type','ref_no','amount','net_effect','running_balance','payment_method','note'];
      res.write('\uFEFF'); // BOM
      res.write(header.join(',') + '\n');
      for (const r of rows) {
        const line = [
          r.tx_datetime,
          r.tx_type,
          r.ref_no,
          Number(r.amount).toFixed(2),
          Number(r.net_effect).toFixed(2),
          Number(r.running_balance).toFixed(2),
          r.payment_method || '',
          (r.note || '').replace(/\r?\n/g,' ').replace(/"/g,'""'),
        ].map(v => `"${String(v ?? '')}"`).join(',');
        res.write(line + '\n');
      }
      res.end();
    });
  },

  // PDF Export (formatted)
  exportStatementPDF: (req, res) => {
    const id = Number(req.params.id);
    const { from: qFrom, to: qTo, sort = 'asc' } = req.query;
    const page = 1, limit = 100000, offset = 0;
    const sortDir = String(sort || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    // Dates
    const now = new Date();
    const defaultTo = now.toISOString().slice(0, 10);
    const defaultFrom = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const from = safeDate(qFrom, defaultFrom);
    const to = safeDate(qTo, defaultTo);

    const finish = (customer, payload) => {
      const rows = payload.rows || [];
      const totals = payload.totals || {};

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="customer_${id}_statement_${from}_${to}.pdf"`);

      const doc = new PDFDocument({ size: 'A4', margin: 36 });
      doc.pipe(res);

      doc.lineWidth(0.5).strokeColor('#111').fillColor('#000');

      const COMPANY_NAME = process.env.COMPANY_NAME || 'Your Company';
      const COMPANY_ADDR = process.env.COMPANY_ADDR || '';
      const COMPANY_GST  = process.env.COMPANY_GST  || '';

      const custName  = customer?.name || rows[0]?.customer_name || `Customer #${id}`;
      const custGST   = customer?.GST_No || customer?.gst_no || '-';
      const custPhone = customer?.phone || '-';
      const custAddr  = customer?.address || '-';

      const fmt = (n) => (Number(n || 0)).toFixed(2);
      const W = doc.page.width;
      const left = doc.page.margins.left;
      const right = W - doc.page.margins.right;
      const line = (x1, y1, x2, y2) => doc.moveTo(x1, y1).lineTo(x2, y2).stroke();

      // Header band
      doc.font('Helvetica-Bold').fontSize(16).text(COMPANY_NAME, left, doc.y, { width: right - left });
      if (COMPANY_ADDR) doc.font('Helvetica').fontSize(9).fillColor('#444').text(COMPANY_ADDR, { width: right - left });
      if (COMPANY_GST) doc.text(`GSTIN: ${COMPANY_GST}`, { width: right - left });
      doc.fillColor('#000').moveDown(0.3);
      doc.font('Helvetica-Bold').fontSize(12).text('Customer Statement', { align: 'right' });
      line(left, doc.y, right, doc.y);
      doc.moveDown(0.6);

      // Customer panel
      const boxTop = doc.y, boxH = 60, boxW = right - left;
      doc.save();
      doc.rect(left, boxTop, boxW, boxH).fillColor('#f8fafc').fill();
      doc.restore();
      doc.rect(left, boxTop, boxW, boxH).lineWidth(0.8).strokeColor('#0f172a').stroke();

      doc.font('Helvetica-Bold').fontSize(10).fillColor('#111').text('Customer:', left + 8, boxTop + 6);
      doc.font('Helvetica').fontSize(10).fillColor('#000').text(custName, left + 75, boxTop + 6, { width: 280 });
      doc.font('Helvetica-Bold').text('GSTIN:', left + 8, boxTop + 22);
      doc.font('Helvetica').text(custGST, left + 75, boxTop + 22, { width: 280 });
      doc.font('Helvetica-Bold').text('Phone:', left + 8, boxTop + 38);
      doc.font('Helvetica').text(custPhone, left + 75, boxTop + 38, { width: 280 });
      doc.font('Helvetica-Bold').text('Address:', left + 8, boxTop + 54);
      doc.font('Helvetica').text(custAddr, left + 75, boxTop + 54, { width: boxW - 85 });

      doc.font('Helvetica-Bold').text('Period:', right - 210, boxTop + 6, { width: 60, align: 'right' });
      doc.font('Helvetica').text(`${from} → ${to}`, right - 145, boxTop + 6, { width: 145, align: 'left' });
      doc.font('Helvetica-Bold').text('Generated:', right - 210, boxTop + 22, { width: 60, align: 'right' });
      doc.font('Helvetica').text(new Date().toLocaleString(), right - 145, boxTop + 22, { width: 145, align: 'left' });
      doc.y = boxTop + boxH + 10;

      // KPIs
      const yKpi = doc.y;
      const kpiW = (right - left) / 5;
      const KPI = [
        ['Opening', `₹${fmt(totals.opening_balance)}`],
        ['Invoiced', `₹${fmt(totals.total_invoiced)}`],
        ['Paid', `₹${fmt(totals.total_paid)}`],
        ['Outstanding', `₹${fmt(totals.outstanding_as_of || totals.outstanding_as_of_to)}`],
        ['Payments', `${totals.payment_count || totals.payment_count_upto || 0}`],
      ];
      KPI.forEach(([k, v], i) => {
        const x = left + i * kpiW;
        doc.font('Helvetica').fontSize(9).fillColor('#666').text(k, x, yKpi);
        doc.font('Helvetica-Bold').fillColor('#000').text(v, x, doc.y);
      });
      doc.moveDown(0.6);

     // Table config
const cols = ['Date/Time', 'Type', 'Ref No', 'Amount', 'Net Effect', 'Run Bal', 'Method', 'Remarks'];
const widths = [90, 45, 70, 60, 60, 60, 60, 170];
const colAlign = ['left', 'center', 'left', 'right', 'right', 'right', 'left', 'left'];
const colX = widths.reduce((acc, w, i) => {
  acc.push((i === 0 ? left : acc[i - 1] + widths[i - 1]));
  return acc;
}, []);
const headerH = 18, rowH = 16;
const bottom = doc.page.height - doc.page.margins.bottom - 30;

// Draw Header
const drawHeader = () => {
  doc.save();
  doc.rect(left, doc.y, right - left, headerH).fillColor('#f1f5f9').fill();
  doc.restore();

  line(left, doc.y, right, doc.y);
  doc.fillColor('#111').font('Helvetica-Bold').fontSize(9);

  cols.forEach((c, i) => {
    const align = colAlign[i];
    doc.text(c, colX[i] + 4, doc.y + 3, { width: widths[i] - 8, align });
  });

  line(left, doc.y + headerH, right, doc.y + headerH);
  doc.y += headerH + 2;
  doc.fillColor('#000').font('Helvetica');
};

// Footer with proper page number
const addFooter = () => {
  const ts = new Date().toLocaleString();
  const footerY = doc.page.height - doc.page.margins.bottom + 5;
  doc.fontSize(8).fillColor('#555');
  doc.text(`Printed: ${ts}`, left, footerY, { width: (right - left) / 2, align: 'left' });
  doc.text(`Page ${doc.page.number}`, left + (right - left) / 2, footerY, {
    width: (right - left) / 2,
    align: 'right',
  });
  doc.fillColor('#000');
};

// Draw table rows
drawHeader();
let zebra = false;

for (const r of rows) {
  if (doc.y + rowH > bottom) {
    addFooter();
    doc.addPage();
    drawHeader();
    zebra = false;
  }

  if (zebra) {
    doc.save();
    doc.rect(left, doc.y - 1, right - left, rowH).fillColor('#fafafa').fill();
    doc.restore();
  }
  zebra = !zebra;

  const data = [
    r.tx_datetime,
    r.tx_type,
    r.ref_no,
    `₹${fmt(r.amount)}`,
    `₹${fmt(r.net_effect)}`,
    `₹${fmt(r.running_balance)}`,
    r.payment_method || '-',
    r.note || '',
  ];

  doc.fontSize(9).fillColor('#000');
  data.forEach((v, i) => {
    doc.text(String(v), colX[i] + 4, doc.y, { width: widths[i] - 8, align: colAlign[i] });
  });

  const yLine = doc.y + 12;
  doc.strokeColor('#cbd5e1');
  line(left, yLine, right, yLine);
  doc.strokeColor('#111');
  doc.y = yLine + 2;
}

// Add final footer
addFooter();

      doc.end();
    };

    Customer.getById(id, (errCust, customer) => {
      Customer.getStatementQuery({ customerId: id, from, to, limit, offset, sort: sortDir }, (errStmt, payload) => {
        if (errCust && !customer) return res.status(500).send('Failed to load customer');
        if (errStmt) return res.status(500).send('Failed to export');
        finish(customer, payload);
      });
    });

    console.log('PDF export hit', { id, from, to, sort: sortDir });
  },
};

module.exports = CustomerController;
