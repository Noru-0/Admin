var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

// Render the account management page
const renderAccount = async (req, res) => {
    try {
        const users = await prisma.user.findMany(); // Lấy tất cả người dùng

        const filteredUsers = users.map(user => {
            const createdAtInVietnamTime = new Intl.DateTimeFormat('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
                timeZone: 'Asia/Ho_Chi_Minh',  // Vietnam time zone (UTC+7)
            }).format(new Date(user.createdAt));

            return {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                phone: user.phone,
                status: user.status,
                createdAt: createdAtInVietnamTime, // formatted date in Vietnam time
            };
        });

        res.render("admin/account", { users: filteredUsers }); // Trả về trang quản lý tài khoản với danh sách người dùng
    } catch (error) {
        console.error("Error loading account management page:", error);
        res.status(500).send("Error loading account management page.");
    }
};

// Controller to get users with pagination
const getUsers = async (req, res) => {
    try {
        const { username, email, role, sortBy, sortOrder, page = 1, pageSize = 6 } = req.query;

        // Build query filters
        const filter = {};
        if (username) filter.username = { contains: username, mode: 'insensitive' }; // Search username
        if (email) filter.email = { contains: email, mode: 'insensitive' };
        if (role && role !== "all") filter.role = { contains: role, mode: 'insensitive' };

        // Build sorting options
        const sort = sortBy
            ? { [sortBy]: sortOrder === "desc" ? 'desc' : 'asc' }
            : undefined;

        // Calculate pagination
        const skip = (page - 1) * pageSize;

        // Fetch total count for pagination
        const totalCount = await prisma.user.count({ where: filter });

        // Fetch users for the current page
        const users = await prisma.user.findMany({
            where: filter,
            skip: parseInt(skip, 10),
            take: parseInt(pageSize, 10),
            orderBy: sort,
        });

        const totalPages = Math.ceil(totalCount / pageSize);

        res.status(200).json({ users, totalPages });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Block user
const blockUser = async (req, res) => {
    try {
        const { userIds } = req.body; // Get the userIds array from the request body

        if (!Array.isArray(userIds)) {
            return res.status(400).json({ message: 'Invalid userIds format' });
        }

        // Convert userIds to integers
        const userIdsInt = userIds.map(id => parseInt(id, 10));

        // Update the status of all selected users to false (blocked)
        await prisma.user.updateMany({
            where: {
                id: { in: userIdsInt }, // Block users whose IDs are in the userIds array
            },
            data: { status: false },
        });

        res.status(200).json({ message: 'Selected users have been blocked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error blocking users' });
    }
};

// Unblock user
const unblockUser = async (req, res) => {
    try {
        const { userIds } = req.body; // Get the userIds array from the request body

        if (!Array.isArray(userIds)) {
            return res.status(400).json({ message: 'Invalid userIds format' });
        }

        // Convert userIds to integers
        const userIdsInt = userIds.map(id => parseInt(id, 10));

        // Update the status of all selected users to true (unblocked)
        await prisma.user.updateMany({
            where: {
                id: { in: userIdsInt }, // Unblock users whose IDs are in the userIds array
            },
            data: { status: true },
        });

        res.status(200).json({ message: 'Selected users have been unblocked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error unblocking users' });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const { userIds } = req.body; // Get the userIds array from the request body

        if (!Array.isArray(userIds)) {
            return res.status(400).json({ message: 'Invalid userIds format' });
        }

        // Convert userIds to integers
        const userIdsInt = userIds.map(id => parseInt(id, 10));

        // Delete all selected users
        await prisma.user.deleteMany({
            where: {
                id: { in: userIdsInt }, // Delete users whose IDs are in the userIds array
            },
        });

        res.status(200).json({ message: 'Selected users have been deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting users' });
    }
};

// Lấy danh sách người dùng đã lọc và sắp xếp
const getFilteredAndSortedUsers = async (req, res) => {
    try {
        const { username, email, sortBy, sortOrder, role } = req.query;

        // Build query filters
        const filter = {};
        if (username) filter.username = { contains: username, mode: 'insensitive' }; // Search username
        if (email) filter.email = { contains: email, mode: 'insensitive' };
        if (role && role !== "all") filter.role = role;

        // Build sorting options
        const sort = {};
        if (sortBy) {
            sort[sortBy] = sortOrder === "desc" ? 'desc' : 'asc';
        }

        // Fetch users from the database
        const users = await prisma.user.findMany({
            where: filter,
            orderBy: sort
        });

        res.status(200).json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { renderAccount, getUsers, blockUser, unblockUser, deleteUser, getFilteredAndSortedUsers };