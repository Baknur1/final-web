const express = require('express');
const router = express.Router();
const AuthController = require('../controller/authController');
const { isAuthenticated } = require('../middleware/auth');
const { validate, authSchemas } = require('../middleware/validation');

router.post('/register', validate(authSchemas.register), AuthController.register);
router.post('/login', validate(authSchemas.login), AuthController.login);
router.get('/profile', isAuthenticated, AuthController.getProfile);
router.put('/profile', isAuthenticated, AuthController.updateProfile);

module.exports = router;
