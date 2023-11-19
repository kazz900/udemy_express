const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');
// session import
const session = require('express-session');
// Sequelize import
const { Sequelize, DataTypes } = require('sequelize');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

// MongoDB import
const mongoConnect = require('./util/mongodbsetting');

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

// STORE EXTENDDEFAULTFIELDS
// sequelize.define("Session", {
//     sid: {
//       type: Sequelize.STRING,
//       primaryKey: true,
//     },
//     userId: Sequelize.STRING,
//     expires: Sequelize.DATE,
//     data: Sequelize.TEXT,
//     isLoggedin: DataTypes.BOOLEAN
// });

// function extendDefaultFields(defaults, session) {
//     return {
//         data: defaults.data,
//         expires: defaults.expires,
//         userId: session.userId,
//         isLoggedin: session.isLoggedin
//     };
// }

// sequelizeStore setting
const store = new SequelizeStore({
    db: sequelize,
    // table: "Session",
    checkExpirationInterval: 1 * 60 * 60 * 1000, // every 1 hour
    expiration: 30 * 60 * 1000, // expires in 5 min
});

// register middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: "test secret",
    store: store,
    resave: false,
    saveUninitialized: false,
}));

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

// -------------- Mongodb --------------------
mongoConnect(client => {
    app.listen(50000);
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
