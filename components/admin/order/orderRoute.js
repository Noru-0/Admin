const express = require('express');
const orderController = require('./orderController');
const router = express.Router();
const { ensureAdmin } = require('../../../middlewares/authMiddleware');

// API support account management
router.get('/', ensureAdmin, orderController.renderOrder);

module.exports = router;
