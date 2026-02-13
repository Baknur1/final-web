const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const managerRoutes = require('./managerRoutes');
const workerRoutes = require('./workerRoutes');
const supplierRoutes = require('./supplierRoutes');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: 'Слишком много запросов с этого IP, пожалуйста войдите позже'
});

router.use(limiter);

router.use('/auth', authRoutes);
router.use('/users', authRoutes);
router.use('/admin', adminRoutes);
router.use('/manager', managerRoutes);
router.use('/worker', workerRoutes);
router.use('/supplier', supplierRoutes);

module.exports = router;
