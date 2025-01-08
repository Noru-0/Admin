const express = require('express');
const router = express.Router();
const dashboardRouter = require('./dashboard/dashboardRoute');
const accountRouter = require('./account/accountRoute');
const productRouter = require('./product/productRoute');
const orderRouter = require('./order/orderRoute');

router.use('/dashboard', dashboardRouter);
router.use('/account', accountRouter);
router.use('/product', productRouter);
router.use('/order', orderRouter);

module.exports = router;
