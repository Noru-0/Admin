var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

// Model functions for User
const getAllUsers = async () => {
    return await prisma.user.findMany();
};

const getFilteredUsers = async (filter, sort, skip, take) => {
    const totalCount = await prisma.user.count({ where: filter });
    const users = await prisma.user.findMany({
        where: filter,
        skip: parseInt(skip, 10),
        take: parseInt(take, 10),
        orderBy: sort,
    });
    return { users, totalCount };
};

const updateUserStatus = async (userIds, status) => {
    return await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { status },
    });
};

const deleteUsers = async (userIds) => {
    return await prisma.user.deleteMany({
        where: { id: { in: userIds } },
    });
};

module.exports = {
    getAllUsers,
    getFilteredUsers,
    updateUserStatus,
    deleteUsers,
};
