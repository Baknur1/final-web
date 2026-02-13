const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const managerRoutes = require('./managerRoutes');
const workerRoutes = require('./workerRoutes');
const supplierRoutes = require('./supplierRoutes');

// Rate limit middleware: максимум 100 запросов за 15 минут
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // лимит 100 запросов на IP
    message: 'Слишком много запросов с этого IP, пожалуйста войдите позже'
});

// Применяем rate limit ко всем маршрутам
router.use(limiter);

router.use('/auth', authRoutes);
router.use('/users', authRoutes);
router.use('/admin', adminRoutes);
router.use('/manager', managerRoutes);
router.use('/worker', workerRoutes);
router.use('/supplier', supplierRoutes);

module.exports = router;
