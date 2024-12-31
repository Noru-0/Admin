var express = require('express');
var { showFeaturedProducts } = require('./indexController');
var router = express.Router();

router.get('/', showFeaturedProducts);

module.exports = router;
