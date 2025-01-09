var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

// Fetch paginated and filtered orders
const fetchOrders = async (filters) => {
    const { skip, limit, where, orderBy } = filters;
    return prisma.order.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy,
        include: {
            user: true,
        },
    });
};

// Count total orders with filters
const countOrders = async (where) => {
    return prisma.order.count({
        where: Object.keys(where).length > 0 ? where : undefined,
    });
};

// Fetch a single order by ID
const fetchOrderById = async (id) => {
    return prisma.order.findUnique({
        where: { id: parseInt(id) },
        include: {
            user: true,
            orderProducts: {
                include: {
                    product: true,
                },
            },
        },
    });
};

// Update order status
const updateOrder = async (id, status) => {
    return prisma.order.update({
        where: { id: parseInt(id) },
        data: { orderStatus: status },
    });
};

module.exports = { fetchOrders, countOrders, fetchOrderById, updateOrder };
