const {
    getAllUsers,
    getFilteredUsers,
    updateUserStatus,
    deleteUsers,
} = require('./accountModel');

const renderAccount = async (req, res) => {
    try {
        const users = await getAllUsers();

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
                timeZone: 'Asia/Ho_Chi_Minh',
            }).format(new Date(user.createdAt));

            return {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                phone: user.phone,
                status: user.status,
                createdAt: createdAtInVietnamTime,
            };
        });

        res.render('admin/account', { users: filteredUsers });
    } catch (error) {
        console.error('Error loading account management page:', error);
        res.status(500).send('Error loading account management page.');
    }
};

const getUsers = async (req, res) => {
    try {
        const { username, email, role, sortBy, sortOrder, page = 1, pageSize = 6 } = req.query;

        const filter = {};
        if (username) filter.username = { contains: username, mode: 'insensitive' };
        if (email) filter.email = { contains: email, mode: 'insensitive' };
        if (role && role !== 'all') filter.role = { contains: role, mode: 'insensitive' };

        const sort = sortBy
            ? { [sortBy]: sortOrder === 'desc' ? 'desc' : 'asc' }
            : undefined;

        const skip = (page - 1) * pageSize;
        const { users, totalCount } = await getFilteredUsers(filter, sort, skip, pageSize);

        const totalPages = Math.ceil(totalCount / pageSize);

        res.status(200).json({ users, totalPages });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const blockUser = async (req, res) => {
    try {
        const { userIds } = req.body;
        if (!Array.isArray(userIds)) {
            return res.status(400).json({ message: 'Invalid userIds format' });
        }

        const userIdsInt = userIds.map(id => parseInt(id, 10));
        await updateUserStatus(userIdsInt, false);
        res.status(200).json({ message: 'Selected users have been blocked successfully' });
    } catch (error) {
        console.error('Error blocking users:', error);
        res.status(500).json({ message: 'Error blocking users' });
    }
};

const unblockUser = async (req, res) => {
    try {
        const { userIds } = req.body;
        if (!Array.isArray(userIds)) {
            return res.status(400).json({ message: 'Invalid userIds format' });
        }

        const userIdsInt = userIds.map(id => parseInt(id, 10));
        await updateUserStatus(userIdsInt, true);
        res.status(200).json({ message: 'Selected users have been unblocked successfully' });
    } catch (error) {
        console.error('Error unblocking users:', error);
        res.status(500).json({ message: 'Error unblocking users' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { userIds } = req.body;
        if (!Array.isArray(userIds)) {
            return res.status(400).json({ message: 'Invalid userIds format' });
        }

        const userIdsInt = userIds.map(id => parseInt(id, 10));
        await deleteUsers(userIdsInt);
        res.status(200).json({ message: 'Selected users have been deleted successfully' });
    } catch (error) {
        console.error('Error deleting users:', error);
        res.status(500).json({ message: 'Error deleting users' });
    }
};

module.exports = {
    renderAccount,
    getUsers,
    blockUser,
    unblockUser,
    deleteUser,
};
