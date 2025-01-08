const express = require('express');
const dashboardController = require('./dashboardController');
const router = express.Router();
const { ensureAdmin } = require('../../../middlewares/authMiddleware');

router.get('/', ensureAdmin, dashboardController.renderDashboard);

module.exports = router;
