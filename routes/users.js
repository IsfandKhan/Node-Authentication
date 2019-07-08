var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

var upload = require('multer')({
  dest: './uploads'
});

var router = require('express').Router();

var User = require('../models/user');

/* GET users listing. */

router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function (req, res) {
  res.render('register', {
    title: 'Register'
  });
});

router.get('/login', function (req, res) {
  res.render('login', {
    title: 'Login'
  });
});

router.get('/logout', function (req, res) {
  req.logOut();
  req.flash('success', 'You are now logged out');
  res.redirect('/users/login');
});

router.post('/register', upload.single('profileimage'), function (req, res) {
  var view = req.body;
  var name = view.name;
  var email = view.email;
  var username = view.username;
  var pass = view.password;
  var pass2 = view.password2;
  var img = req.file;
  var profileImage;

  if (img) {
    console.log('Uploading File...');
    profileImage = img.filename;
  } else {
    console.log('No File Uploaded...');
    profileImage = 'noimage.jpg';
  }

  req.checkBody('name', 'Name feild is required').notEmpty();
  req.checkBody('email', 'Email feild is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password feild is required').notEmpty();
  req.checkBody('password2', 'Confirm Password feild is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(pass);

  var err = req.validationErrors();

  if (err) {
    res.render('register', {
      errors: err
    });
  } else {
    User.getUserByUsername(username, function (err, user) {
      if (err) throw err;

      if (user) {
        req.flash('error', 'Username Already exists');
        res.redirect('/users/register');
      } else {
        User.getUserByEmail(email, function (err, user) {
          if (err) throw err;

          if (user) {
            req.flash('error', 'An account is already linked to the email provided');
            res.redirect('/users/register');
          } else {
            var newUser = new User({
              name: name,
              email: email,
              username: username,
              password: pass,
              profileimage: profileImage
            });

            User.createUser(newUser, function (err, user) {
              if (err) throw err;
              console.log(user);
            });

            req.flash('success', 'You are now registered and can login');
            res.redirect('/');
          }
        });
      }
      console.log(user);
    });
  }
});

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/users/login',
    failureFlash: 'Invalid Username or Password'
  }),
  function (req, res) {
    req.flash('success', 'You are now logged in');
    res.redirect('/');
  });

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new localStrategy(function (username, password, done) {
  User.getUserByUsername(username, function (err, user) {
    if (err) throw err;

    if (!user) {
      return done(null, false, {
        messages: 'Unknown User'
      });
    }

    User.comparePassword(password, user.password, function (err, isMatch) {
      if (err) done(err);

      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, {
          messages: 'Invalid Password'
        });
      }
    });
  });
}));

module.exports = router;