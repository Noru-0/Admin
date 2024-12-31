var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var { findUserByUsername } = require('./usersModel');
var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    var user = await findUserByUsername(username);
    if (!user) {
      return done(null, false, { message: 'Incorrect username' });
    }

    var isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect password' });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Serialize user to save in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        var user = await prisma.user.findUnique({ where: { id } });
        if (user) {
        done(null, user);
        } else {
        done(null, false);
        }
    } catch (error) {
        done(error);
    }
});

module.exports = passport;
