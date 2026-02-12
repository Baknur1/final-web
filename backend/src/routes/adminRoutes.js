const express = require('express');
const router = express.Router();
const AdminController = require('../controller/adminController');
const { isAuthenticated, isAuthorized } = require('../middleware/auth');
const { validate, authSchemas, resourceSchemas } = require('../middleware/validation');

router.post('/warehouses', isAuthenticated, isAuthorized(['super_admin']), validate(resourceSchemas.warehouse), AdminController.createWarehouse);
router.get('/warehouses', isAuthenticated, isAuthorized(['super_admin', 'manager', 'worker', 'supplier']), AdminController.getAllWarehouses);
router.delete('/warehouses/:id', isAuthenticated, isAuthorized(['super_admin']), AdminController.deleteWarehouse);
router.post('/register-manager', isAuthenticated, isAuthorized(['super_admin']), validate(authSchemas.register), AdminController.registerManager);
router.get('/all-items', isAuthenticated, isAuthorized(['super_admin']), AdminController.getAllItems);
router.get('/all-users', isAuthenticated, isAuthorized(['super_admin']), AdminController.getAllUsers);
router.delete('/users/:id', isAuthenticated, isAuthorized(['super_admin']), AdminController.deleteUser);
router.get('/audit-logs', isAuthenticated, isAuthorized(['super_admin', 'manager', 'worker', 'supplier']), AdminController.getAuditLogs);

module.exports = router;
