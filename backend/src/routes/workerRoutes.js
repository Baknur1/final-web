const express = require('express');
const router = express.Router();
const WorkerController = require('../controller/workerController');
const { isAuthenticated, isAuthorized } = require('../middleware/auth');

router.get('/pending-items', isAuthenticated, isAuthorized(['worker']), WorkerController.getPendingItems);
router.put('/items/:id/scan', isAuthenticated, isAuthorized(['worker']), WorkerController.scanItem);
router.post('/items/outgoing', isAuthenticated, isAuthorized(['worker']), WorkerController.outgoingItem);
router.get('/inventory', isAuthenticated, isAuthorized(['worker']), WorkerController.getInventory);

module.exports = router;
