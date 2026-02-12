const express = require('express');
const router = express.Router();
const ManagerController = require('../controller/managerController');
const { isAuthenticated, isAuthorized } = require('../middleware/auth');
const { validate, authSchemas } = require('../middleware/validation');

router.post('/register-worker', isAuthenticated, isAuthorized(['manager', 'super_admin']), validate(authSchemas.register), ManagerController.registerWorker);
router.get('/staff', isAuthenticated, isAuthorized(['manager']), ManagerController.getWarehouseStaff);
router.get('/items', isAuthenticated, isAuthorized(['manager']), ManagerController.getWarehouseItems);
router.get('/warehouse', isAuthenticated, isAuthorized(['manager']), ManagerController.getMyWarehouse);
router.delete('/staff/:id', isAuthenticated, isAuthorized(['manager']), ManagerController.deleteWorker);
router.delete('/items/:id', isAuthenticated, isAuthorized(['manager']), ManagerController.deleteItem);

module.exports = router;
