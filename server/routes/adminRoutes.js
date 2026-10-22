const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/stats', adminController.getStats);
router.post('/assign', adminController.assignTechnician);
router.get('/categories', adminController.getCategories);
router.get('/technicians', adminController.getTechnicians);

module.exports = router;