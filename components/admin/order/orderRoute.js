const express = require('express');
const orderController = require('./orderController');
const router = express.Router();
const { ensureAdmin } = require('../../../middlewares/authMiddleware');

// API support account management
router.get('/', ensureAdmin, orderController.renderOrder);
router.get('/get-orders', ensureAdmin, orderController.getOrders);
router.get('/get-order-details/:id', ensureAdmin, orderController.getOrderById);
router.put('/update-status/:id', ensureAdmin, orderController.updateOrderStatus);

module.exports = router;
