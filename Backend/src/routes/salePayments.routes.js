const express = require('express');
const salePaymentsRoutes = express.Router();
const SalePaymentsController = require('../controllers/salePayments.controller');

// Add payment
salePaymentsRoutes.post('/', SalePaymentsController.addPayment);

// List payments for a sale
salePaymentsRoutes.get('/sale/:sale_id', SalePaymentsController.getPaymentsBySale);

// Delete a payment
salePaymentsRoutes.delete('/:id', SalePaymentsController.deletePayment);

// Customer ledger and summary
salePaymentsRoutes.get('/ledger/:customer_id', SalePaymentsController.getCustomerLedger);
salePaymentsRoutes.get('/summary/:customer_id', SalePaymentsController.getCustomerSummary);

module.exports = salePaymentsRoutes;


