const express = require('express');
const router = express.Router();
const AuthController = require('../controller/authController');
const AdminController = require('../controller/adminController');
const ManagerController = require('../controller/managerController');
const WorkerController = require('../controller/workerController');
const SupplierController = require('../controller/supplierController');
const { isAuthenticated, isAuthorized } = require('../middleware/auth');
const { validate, authSchemas, resourceSchemas } = require('../middleware/validation');

// Auth Routes
router.post('/auth/register', validate(authSchemas.register), AuthController.register);
router.post('/auth/login', validate(authSchemas.login), AuthController.login);
router.get('/users/profile', isAuthenticated, AuthController.getProfile);
router.put('/users/profile', isAuthenticated, AuthController.updateProfile);

// Admin Routes
router.post('/warehouses', isAuthenticated, isAuthorized(['super_admin']), validate(resourceSchemas.warehouse), AdminController.createWarehouse);
router.get('/warehouses', isAuthenticated, isAuthorized(['super_admin', 'manager', 'supplier']), AdminController.getAllWarehouses);
router.delete('/warehouses/:id', isAuthenticated, isAuthorized(['super_admin']), AdminController.deleteWarehouse);
router.post('/admin/register-manager', isAuthenticated, isAuthorized(['super_admin']), validate(authSchemas.register), AdminController.registerManager);
router.get('/admin/all-items', isAuthenticated, isAuthorized(['super_admin']), AdminController.getAllItems);
router.get('/admin/all-users', isAuthenticated, isAuthorized(['super_admin']), AdminController.getAllUsers);

// Manager Routes
router.post('/manager/register-worker', isAuthenticated, isAuthorized(['manager', 'super_admin']), validate(authSchemas.register), ManagerController.registerWorker);
router.get('/manager/staff', isAuthenticated, isAuthorized(['manager']), ManagerController.getWarehouseStaff);
router.get('/manager/items', isAuthenticated, isAuthorized(['manager']), ManagerController.getWarehouseItems);
router.get('/manager/warehouse', isAuthenticated, isAuthorized(['manager']), ManagerController.getMyWarehouse);
router.delete('/resource/:id', isAuthenticated, isAuthorized(['manager']), ManagerController.deleteItem);

// Worker Routes
router.get('/worker/pending-items', isAuthenticated, isAuthorized(['worker']), WorkerController.getPendingItems);
router.put('/resource/:id', isAuthenticated, isAuthorized(['worker']), WorkerController.updateItemStatus);
router.get('/worker/inventory', isAuthenticated, isAuthorized(['worker']), WorkerController.getInventory);

// Supplier Routes
router.post('/resource', isAuthenticated, isAuthorized(['supplier']), validate(resourceSchemas.item), SupplierController.createItemRequest);
router.get('/resource', isAuthenticated, isAuthorized(['supplier', 'manager', 'super_admin']), SupplierController.getMyItems);
router.put('/resource/:id/pickup', isAuthenticated, isAuthorized(['supplier']), SupplierController.pickupItem);

module.exports = router;
