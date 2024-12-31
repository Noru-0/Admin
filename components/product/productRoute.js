var express = require('express');
var { getProduct, showProductDetails, searchFilter } = require('./productController');
var router = express.Router();

router.get('/:name', showProductDetails);
router.post('/search-filter', searchFilter);
router.get('/', getProduct);

module.exports = router;
