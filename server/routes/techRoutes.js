const express = require('express');
const router = express.Router();
const techController = require('../controllers/techController');

router.get('/tasks', techController.getMyTasks);
router.post('/update', techController.updateTaskStatus);

module.exports = router;