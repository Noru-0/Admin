const express = require('express');
const accountController = require('./accountController');
const router = express.Router();
const { ensureAdmin } = require('../../../middlewares/authMiddleware');

// API support account management
router.get('/', ensureAdmin, accountController.renderAccount);
router.delete('/users/delete', ensureAdmin, accountController.deleteUser);
router.patch('/users/block', ensureAdmin, accountController.blockUser);
router.patch('/users/unblock', ensureAdmin, accountController.unblockUser);
router.get('/users', ensureAdmin, accountController.getUsers);

module.exports = router;
