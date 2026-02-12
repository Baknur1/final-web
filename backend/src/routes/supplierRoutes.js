const express = require('express');
const router = express.Router();
const SupplierController = require('../controller/supplierController');
const { isAuthenticated, isAuthorized } = require('../middleware/auth');
const { validate, resourceSchemas } = require('../middleware/validation');

router.post('/items', isAuthenticated, isAuthorized(['supplier']), validate(resourceSchemas.item), SupplierController.createItemRequest);
router.get('/items', isAuthenticated, isAuthorized(['supplier', 'manager', 'super_admin']), SupplierController.getMyItems);
router.put('/items/:id/pickup', isAuthenticated, isAuthorized(['supplier']), SupplierController.pickupItem);
router.get('/matching-warehouses', isAuthenticated, isAuthorized(['supplier']), SupplierController.getMatchingWarehouses);

module.exports = router;
