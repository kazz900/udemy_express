const bcrypt = require('bcryptjs');
const User = require('../models/user');

// EMAIL
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: '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'
  }
}));

// TOKEN
const crypto = require('crypto');

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0){
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0){
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage : message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({email: email})
    .then(user => {
      if (!user){
        // usig flash message
        req.flash('error', 'Invalid email or password.')
        return res.redirect('/login');
      }

      // comparing input password with encrypted password
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch){
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('error', 'Invalid email or password.')
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
      });
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({email: email})
  .then(userDoc => {
    if (userDoc) {
      req.flash('error', 'E-mail exists already, please pick a different one')
      return res.redirect('/signup');
    }
    // encypting password, 12 is secure
    return bcrypt
      .hash(password, 12)
      .then(hashedPassword => {
        const user = new User({
          email: email,
          password: hashedPassword,
          cart: { items: [] }
        });
      return user.save();
    });
  })
  .then(result => {
    res.redirect('/login');
    return transporter.sendMail({
      to: email,
      from: 'hwabum.kim@molpax.com',
      subject: '사랑의 메시지',
      html: '<h1>사랑해</h1>'
    })
    .catch(err => {console.log(err)});
  })
  .catch(err => {
    console.log(err);
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0){
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/reset', {
    path: 'auth/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  const email = req.body.email;
  // creating random 32 byte buffer
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect('/reset');
    }

    // converts random 32 byte buffer to string
    const token = buffer.toString('hex');

    // first find a user with email
    User.findOne({email: req.body.email})
    .then(user => {
      if (!user) {
        // if user does not exist, just redirect with message
        req.flash('error', 'No account with that email found.')
        return res.redirect('/reset');
      }

      // if user exists, set reset token and token's expiration date
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + (1000 * 60 * 60);
      return user.save();
    })
    .then(result => {
      res.redirect('/');
      transporter.sendMail({
        to: email,
        from: 'hwabum.kim@molpax.com',
        subject: 'Password reset',
        html: `
          <p>You requested a password reset</p>
          <p>Click this <a href="http://localhost:30000/reset/${token}">link</a> to set a new password.</p>
        `
      });
    })
    .catch(err => console.log(err));
  });
};