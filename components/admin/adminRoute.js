const express = require('express');
const adminController = require('./adminController');
const router = express.Router();
const { uploadProductImage } = require('../../config/cloud');
const { ensureAdmin } = require('../../middlewares/authMiddleware');

router.get('/', ensureAdmin, adminController.renderDashboard);
router.get('/account', ensureAdmin, adminController.renderAccount);
router.get('/product', ensureAdmin, adminController.renderProduct);

// API support account management
router.delete('/users/delete', ensureAdmin, adminController.deleteUser);
router.patch('/users/block', ensureAdmin, adminController.blockUser);
router.patch('/users/unblock', ensureAdmin, adminController.unblockUser);
router.get('/users', ensureAdmin, adminController.getFilteredAndSortedUsers);

// API support movie management
router.get('/products', ensureAdmin, adminController.getProducts);
router.post('/products', ensureAdmin, uploadProductImage.single('imageUrl'), adminController.createProduct);
router.get('/products/:id', ensureAdmin, adminController.getProductById);
router.put('/products/:id', ensureAdmin, uploadProductImage.single('imageUrl'), adminController.updateProduct);
router.delete('/products/:id', ensureAdmin, adminController.deleteProduct);

module.exports = router;
