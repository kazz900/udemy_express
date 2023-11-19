const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: req.session.isLoggedIn
    });
};

exports.postLogin = (req, res, next) => {
    User.findByPk(1)
    .then(user => {
        user.createCart().then().catch();
        req.session.isLoggedIn = true;
        return req.session.user = user;
    })
    .then(result => {
        res.redirect('/');
    })
    .catch(err => console.log(err));
};