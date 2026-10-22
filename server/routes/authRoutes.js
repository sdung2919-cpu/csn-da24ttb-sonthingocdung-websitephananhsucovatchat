const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Tuyến đường Đăng ký và Đăng nhập
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;