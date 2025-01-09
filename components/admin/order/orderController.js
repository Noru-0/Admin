const { fetchOrders, countOrders, fetchOrderById, updateOrder } = require('./orderModel');

// Render the order management page
const renderOrder = (req, res) => {
    res.render('admin/order', { title: 'Product' });
};

// Get filtered and sorted orders
const getOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 6,
            status,
            sortBy = 'createdAt',
            sortOrder = 'asc',
            search = ''
        } = req.query;

        const skip = (page - 1) * limit;

        // Build the `where` clause
        let where = {};
        if (search.trim() !== '') {
            const numericSearch = !isNaN(search) ? parseInt(search) : null;
            where.OR = numericSearch !== null
                ? [
                    { id: numericSearch },
                    { user: { username: { contains: search, mode: 'insensitive' } } }
                ]
                : [
                    { user: { username: { contains: search, mode: 'insensitive' } } }
                ];
        }
        if (status && status !== 'all') {
            where.orderStatus = status;
        }

        // Define the sorting order
        const orderBy = sortBy === 'customerName'
            ? { user: { username: sortOrder } }
            : { [sortBy]: sortOrder };

        // Fetch orders and total count
        const orders = await fetchOrders({ skip, limit, where, orderBy });
        const totalOrders = await countOrders(where);

        res.json({
            total: totalOrders,
            page: parseInt(page),
            limit: parseInt(limit),
            orders,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching orders' });
    }
};

// Get order by ID
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await fetchOrderById(id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching order details' });
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedOrder = await updateOrder(id, status);

        res.json(updatedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating order status' });
    }
};

module.exports = { renderOrder, getOrders, getOrderById, updateOrderStatus };
