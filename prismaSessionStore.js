var session = require('express-session');
var { PrismaClient } = require('@prisma/client');

var prisma = new PrismaClient();

class PrismaSessionStore extends session.Store {
    constructor() {
        super();
    }

  // Fetch session by ID
    async get(sid, callback) {
        try {
            var session = await prisma.session.findUnique({ where: { sid } });
            if (!session || new Date(session.expire) < new Date()) {
                return callback(null, null);
            }
            callback(null, session.data);
        } catch (err) {
            callback(err);
        }
    }

    // Save session
    async set(sid, data, callback) {
        try {
            var expire = new Date(Date.now() + data.cookie.maxAge);
        await prisma.session.upsert({
            where: { sid },
            update: { data, expire },
            create: { sid, data, expire },
        });
        callback(null);
        } catch (err) {
        callback(err);
        }
    }

  // Destroy session
    async destroy(sid, callback) {
        try {
            await prisma.session.delete({
                where: { sid },
            });
            callback(null); // No errors
        } catch (err) {
            if (err.code === 'P2025') {
                // Prisma error code for "Record to delete does not exist."
                return callback(null); // Ignore the error if the session is not found
            }
            callback(err); // Pass other errors to the callback
        }
    }
}

async function cleanExpiredSessions() {
    try {
        await prisma.session.deleteMany({
            where: {
            expire: {
                lt: new Date(), // Delete sessions where `expire` is less than the current time
            },
            },
        });
        console.log('Expired sessions cleaned up successfully.');
    } catch (err) {
        console.error('Error cleaning up expired sessions:', err);
    }
}

module.exports = PrismaSessionStore;
