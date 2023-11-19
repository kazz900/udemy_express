const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true,
    editing: false,
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  
  // sequelize special method INSERT TO product with association
  const product = new Product({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description
  });

  product.save()
  .then(result => {
    res.redirect('/admin/products');
  })
  .catch(err => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if(!editMode){
    return res.redirect('/');
  }
  // in get method, we can access query url from req.params
  const prodId = req.params.productId;

  Product.findAll({
    where: {
    id: prodId
  }})
  .then(products => {
    const product = products[0];
    if(!product){
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product,
      isAuthenticated: req.session.isLoggedIn
    });
  })
  .catch((err) => {
    console.log(err);
  })
};

exports.postEditProduct = (req, res, next) => {
  // since product id is stored in post method, accessing it from request body
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  Product.findByPk(prodId)
  .then(product => {
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.imageUrl = updatedImageUrl;
    product.updatedDesc = updatedDesc;
    return product.save();
  })
  .then((result) => {
    res.redirect('/admin/products');
  })
  .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.findAll()
  .then((products) => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products',
      isAuthenticated: req.session.isLoggedIn
    });
  })
  .catch((err) => {
    console.log(err);
  });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId)
  .then(product => {
    return product.destroy();
  })
  .then(result => {
    console.log(result);
    res.redirect('/');
  })
  .catch(err => {
    console.log(err);
  })
};
