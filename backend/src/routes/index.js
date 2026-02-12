const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const managerRoutes = require('./managerRoutes');
const workerRoutes = require('./workerRoutes');
const supplierRoutes = require('./supplierRoutes');

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/manager', managerRoutes);
router.use('/worker', workerRoutes);
router.use('/supplier', supplierRoutes);

module.exports = router;
