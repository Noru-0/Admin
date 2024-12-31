var bcrypt = require('bcrypt');
var passport = require('./passportConfig');
var { findUserByUsername, createUser, findUserByEmail } = require('./usersModel');

var getLogin = (req, res) => {
    res.render('login', { title: 'Log in' });
};

var postLogin = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error(err);
        return res.render('login', { error: 'An unexpected error occurred. Please try again.', title: 'Login' });
      }
      if (!user) {
        // `info.message` contains the error message set in `passportConfig.js`
        return res.render('login', { error: info.message, title: 'Login', username: req.body.username });
      }
      req.logIn(user, (err) => {
        if (err) {
          console.error(err);
          return res.render('login', { error: 'Failed to log in. Please try again.', title: 'Login' });
        }
        return res.redirect('/');
      });
    })(req, res, next);
  };

var getRegister = (req, res) => {
    res.render('register', { title: 'Register' });
};

var postRegister = async (req, res) => {
    var { username, email, password, confirmPassword } = req.body;
  
    if (!username || !password || !email || !confirmPassword) {
        return res.render('register', { error: 'All fields are required', title: 'Register' });
  }

    try {
        var existingUser = await findUserByUsername(username);
        var existingEmail = await findUserByEmail(email);

        if (existingUser) {
            return res.render('register', { error: 'Username already exists', title: 'Register' });
        }
        
        if (existingEmail) {
            return res.render('register', { error: 'Email already exists', title: 'Register' });
        }

        if (password !== confirmPassword) {
            return res.render('register', { error: 'Confirm password must be the same as passwword', title: 'Register'});
        }

        var hashedPassword = await bcrypt.hash(password, 10);
        await createUser(username, email, hashedPassword);

        res.render('register', {
          success: 'Registration successful! Please log in.',
          title: 'Register'
        });
      } catch (error) {
        console.error(error);
        res.render('register', { error: 'Something went wrong!', title: 'Register' });
    }
};

var forgotPassword = (req, res) => {
  res.render('forgot-password', { title: 'Forgot Password' });
};

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        // Create an error object to pass to the view
        const error = {
            status: 401,
            message: 'Unauthorized access. Please log in to continue.',
            stack: (new Error()).stack // Optional: include stack trace if needed
        };

        // Render the error page and pass the error object
        res.status(401).render('error', { error });
    }
}

const getInfo = (req, res) => {
    res.render('info', { title: 'Information'});
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

module.exports = { getLogin, postLogin, getRegister, postRegister, 
getInfo, getLogout, ensureAuthenticated, checkAvailability, forgotPassword };
