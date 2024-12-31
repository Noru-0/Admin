var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

var findUserByUsername = async (username) => {
    if (!username) {
        throw new Error('Username is required');
      }
  
    return prisma.user.findUnique({ where: { username } });
};

var findUserByEmail = async (email) => {
    if (!email) {
        throw new Error('Email is required');
      }
  
    return prisma.user.findUnique({ where: { email } });
};

var createUser = async (username, email, hashedPassword) => {
    return prisma.user.create({
        data: { username: username, email: email, password: hashedPassword },
    });
};

module.exports = { findUserByUsername, createUser, findUserByEmail };
