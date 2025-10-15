// src/axios/salePaymentsAPI.js
import { api } from "./axios";

// Sale Payments API aligned with routes/salePayments.routes.js
const paymentsAPI = {
  // POST new payment
  create: (data) => api.post("/sale-payments", data),

  // GET all payments for a specific sale
  getBySaleId: (sale_id) => api.get(`/sale-payments/sale/${sale_id}`),

  // DELETE payment by id
  delete: (id) => api.delete(`/sale-payments/${id}`),

  // GET customer ledger
  getLedgerByCustomer: (customer_id) => api.get(`/sale-payments/ledger/${customer_id}`),

  // GET customer summary
  getSummaryByCustomer: (customer_id) => api.get(`/sale-payments/summary/${customer_id}`),
};

export default paymentsAPI;
  