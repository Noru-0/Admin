const express = require('express');
const productController = require('./productController');
const router = express.Router();
const { uploadProductImage } = require('../../../config/cloud')
const { ensureAdmin } = require('../../../middlewares/authMiddleware');

// API support product management
router.get('/', ensureAdmin, productController.renderProduct);
router.get('/products/check-name', ensureAdmin, productController.checkProductName);
router.get('/products', ensureAdmin, productController.getProducts);
router.post('/products', ensureAdmin, uploadProductImage.array('images', 10), productController.createProductController);
router.get('/products/:id', ensureAdmin, productController.getProductById);
router.put('/products/:id', ensureAdmin, uploadProductImage.array('newImages', 10), productController.updateProductController);
router.delete('/products/:id', ensureAdmin, productController.deleteProductController);

module.exports = router;
