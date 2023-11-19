const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');
// session import
const session = require('express-session');
// Sequelize import
// const { Sequelize, DataTypes } = require('sequelize');
// const SequelizeStore = require('connect-session-sequelize')(session.Store);

// MONGODB
const MongoDBStore = require('connect-mongodb-session')(session);

// MongoDB import
const mongoConnect = require('./util/mongodbsetting');
const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://root:root@cluster0.19xed2k.mongodb.net/?retryWrites=true&w=majority';
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
  });

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

// add middleware so that req.user is an object
app.use((req, res, next) => {
  if(!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      console.log(user);
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

// -------------- Mongodb connection --------------------
mongoose
  .connect(MONGODB_URI)
  .then(result => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'Max',
          email: 'max@test.com',
          cart: {
            items: []
          }
        });
        user.save();
      }
    });
    console.log(`Server started`);
    app.listen(50000);
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
