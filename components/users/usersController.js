var bcrypt = require('bcrypt');
var passport = require('../../config/passport');
var { findUserByUsername, createUser, findUserByEmail } = require('./usersModel');

var getLogin = (req, res) => {
  res.render("login", { layout: "main" });
};

var postLogin = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      return res.render('login', { error: 'An unexpected error occurred. Please try again.', layout: 'main' });
    }
    if (!user) {
      // `info.message` contains the error message set in `passportConfig.js`
      return res.render('login', { error: info.message, layout: 'main', username: req.body.username });
    }
    if (!user.status) {
      return res.render('login', { error: 'Your account is inactive. Please contact support.', layout: 'main' });
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error(err);
        return res.render('login', { error: 'Failed to log in. Please try again.', layout: 'main' });
      }
      return res.redirect('/admin/dashboard');
    });
  })(req, res, next);
};

var getRegister = (req, res) => {
  res.render('register', { layout: 'main' });
};

var postRegister = async (req, res) => {
  var { username, email, password, confirmPassword } = req.body;

  if (!username || !password || !email || !confirmPassword) {
    return res.render('register', { error: 'All fields are required', layout: 'main' });
  }

  try {
    var existingUser = await findUserByUsername(username);
    var existingEmail = await findUserByEmail(email);

    if (existingUser) {
      return res.render('register', { error: 'Username already exists', layout: 'main' });
    }

    if (existingEmail) {
      return res.render('register', { error: 'Email already exists', layout: 'main' });
    }

    if (password !== confirmPassword) {
      return res.render('register', { error: 'Confirm password must be the same as password', layout: 'main' });
    }

    var hashedPassword = await bcrypt.hash(password, 10);
    await createUser(username, email, hashedPassword);

    res.render('register', {
      success: 'Registration successful! Please log in.',
      layout: 'main'
    });
  } catch (error) {
    console.error(error);
    res.render('register', { error: 'Something went wrong!', layout: 'main' });
  }
};

var forgotPassword = (req, res) => {
  res.render('forgot-password', { layout: 'main' });
};

const getInfo = (req, res) => {
  res.render('info', { layout: 'main' });
}

const getLogout = async (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};

const checkAvailability = async (req, res) => {
  const { username, email } = req.query;

  try {
    if (username) {
      const user = await findUserByUsername(username);
      const userExists = user !== null;
      return res.json({ exists: userExists });
    }

    if (email) {
      const user = await findUserByEmail(email);
      const emailExists = user !== null;
      return res.json({ exists: emailExists });
    }

    res.json({ exists: false });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getLogin, postLogin, getRegister, postRegister,
  getInfo, getLogout, checkAvailability, forgotPassword
};
