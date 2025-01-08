var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

// Controller to render the product management page
const renderOrder = (req, res) => {
    res.render('admin/order', { title: 'Product' });
};

module.exports = { renderOrder };