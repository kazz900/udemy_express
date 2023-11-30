const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');
// session import
const session = require('express-session');
// Sequelize import
// const { Sequelize, DataTypes } = require('sequelize');
// const SequelizeStore = require('connect-session-sequelize')(session.Store);

// CSURF 
const csrf = require('csurf');
const flash = require('connect-flash');

// MONGODB
const MongoDBStore = require('connect-mongodb-session')(session);

// MongoDB import
const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://root:root@cluster0.19xed2k.mongodb.net/?retryWrites=true&w=majority';
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

// CSRF 
const csrfProtection = csrf();

// sequelize model imports
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-items');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

// routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// register middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: "test secret",
  store: store,
  resave: false,
  saveUninitialized: false,
}));

// Using csrf middleware after session
app.use(csrfProtection);
// connect-flash (after session)
app.use(flash());

// Tell Express.js that it should be included in every rendred view
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// add middleware so that req.user is an object
app.use((req, res, next) => {
  // outside of async code we can just throw an error
  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      // if user is null return next
      if (!user) {
        return next();
      }

      // making user object available
      req.user = user;
      next();
    })
    .catch(err => {
      // inside async code, we need to use next
      next(new Error(err));
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

// for every routes that are not handled
app.use(errorController.get404);

// middleware for error handling
app.use((error, req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});

// -------------- Mongodb connection --------------------
const port = 30000;

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    console.log(`Server started litsening on ${port}`);
    app.listen(port);
  })
  .catch(err => {
    console.log(err);
  });

// -------------- SQL -----------------------

// DB RELATION
// Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
// User.hasMany(Product);
// User.hasOne(Cart);
// Cart.belongsTo(User);
// Cart.belongsToMany(Product, { through: CartItem });
// Product.belongsToMany(Cart, { through: CartItem });
// Order.belongsTo(User);
// User.hasMany(Order);
// Order.belongsToMany(Product, { through: OrderItem });


// npm start runs below code
// sequelize.sync({force: true})
// sequelize.sync()
//     .then((result) => {
//         return User.findByPk(1);
//     })
//     .then((user) => {
//         if (!user) {
//             return User.create({ name: 'Max', email: 'test@test.com' });
//         }
//         return user;
//     })
//     .then(user => {
//         return user.createCart();
//     })
//     .then(result => {
//         store.sync()
//             .then(result => {
//                 app.listen(50000);
//             })
//             .catch(err => console.log(err));
//     })
//     .catch((err) => console.log(err));
