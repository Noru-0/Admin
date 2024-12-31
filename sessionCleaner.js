var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

async function cleanExpiredSessions() {
    try {
        const result = await prisma.session.deleteMany({
        where: {
            expire: {
            lt: new Date(), // Delete sessions where `expire` is less than the current time
            },
        },
        });
        console.log(`${result.count} expired sessions cleaned up.`);
    } catch (error) {
        console.error('Error cleaning up expired sessions:', error);
    }
}

module.exports = cleanExpiredSessions;
