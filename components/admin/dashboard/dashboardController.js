var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

const renderDashboard = (req, res) => {
    res.render('admin/dashboard', { title: 'Dashboard' });
};

module.exports = { renderDashboard };