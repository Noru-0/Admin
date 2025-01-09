const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new product
const createProduct = async (data) => {
    return await prisma.product.create({ data });
};

// Find product by ID
const findProductById = async (id) => {
    return await prisma.product.findUnique({ where: { id: parseInt(id, 10) } });
};

// Find all products with filters and pagination
const findProducts = async (filters, sort, skip, take) => {
    return await prisma.product.findMany({
        where: filters,
        orderBy: sort,
        skip: skip,
        take: take,
    });
};

// Count total products based on filters
const countProducts = async (filters) => {
    return await prisma.product.count({ where: filters });
};

// Update a product by ID
const updateProduct = async (id, data) => {
    return await prisma.product.update({
        where: { id: parseInt(id, 10) },
        data,
    });
};

// Delete a product by ID
const deleteProduct = async (id) => {
    return await prisma.product.delete({ where: { id: parseInt(id, 10) } });
};

// Check if product name exists (case-insensitive)
const checkProductNameExists = async (name) => {
    return await prisma.product.findFirst({
        where: { lowercaseName: name },
    });
};

module.exports = {
    createProduct,
    findProductById,
    findProducts,
    countProducts,
    updateProduct,
    deleteProduct,
    checkProductNameExists,
};
