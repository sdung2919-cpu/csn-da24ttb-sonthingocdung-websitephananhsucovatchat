const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const upload = require('../middleware/uploadMiddleware');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', upload.array('images', 5), reportController.createReport);
router.get('/', reportController.getAllReports);
router.get('/:id', reportController.getReportById);

module.exports = router;