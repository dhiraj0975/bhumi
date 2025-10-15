const express = require('express');
const companyRoutes = express.Router();
const ctrl = require('../controllers/company.controller');

companyRoutes.post('/', ctrl.create);
companyRoutes.get('/', ctrl.list);

module.exports = companyRoutes;
