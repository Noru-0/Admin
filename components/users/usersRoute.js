var express = require('express');
var { getRegister, postRegister, getLogin, postLogin, getInfo,
    getLogout, checkAvailability, forgotPassword } = require('./usersController');
var { ensureAuthenticated } = require('../../middlewares/authMiddleware');
var router = express.Router();

router.get('/register', getRegister);
router.post('/register', postRegister);
router.get('/', getLogin);
router.get('/forgot-password', forgotPassword);
router.post('/login', postLogin);
router.get('/logout', getLogout);
router.get('/info', ensureAuthenticated, getInfo)
router.get('/check-availability', checkAvailability);

module.exports = router;
