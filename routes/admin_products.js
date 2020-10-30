const express = require('express');
const router = express.Router();
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img')

//get product model
const Product = require('../modals/product');


//get Category model
const Category = require('../modals/category');

// get products index from Database, 
//https://mongoosejs.com/docs/api.html#model_Model.countDocuments
router.get('/', (req, res) => {
 var count;
 Product.countDocuments((err, c) => {
  count = c;
 })

 Product.find((err, products) => {
  res.render('admin/products', {
   products: products,
   count: count
  })

 })

})

// get add product page
router.get('/add-product', (req, res) => {
 const title = '';
 const desc = '';
 const price = '';

 Category.find((err, categories) => {
  res.render('admin/add_product', {
   title,
   desc,
   price,
   categories
  })
 })

})

// Post add page: check validation, check if slug has already exist, otherwise generate a new page
// super simple fix for the mkdirp is to just install the mkdirp@0.5.1 version
router.post('/add-product', (req, res) => {

 let imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";


 req.checkBody('title', 'title must have a value').notEmpty();
 req.checkBody('desc', 'Description must have a value').notEmpty();
 req.checkBody('price', 'Price must have a value').isDecimal();
 req.checkBody('image', 'you must upload an image').isImage(imageFile);


 const { title, desc, price, category } = req.body;
 const slug = title.replace(/\s+/g, '-').toLowerCase()



 const errors = req.validationErrors();
 if (errors) {
  Category.find((err, categories) => {
   res.render('admin/add_product', {
    errors,
    title,
    desc,
    price,
    categories
   })
  })
 }
 else {
  Product.findOne({ slug: slug }, (err, product) => {
   if (product) {
    req.flash('danger', 'Product title exists, choose another');
    Category.find((err, categories) => {
     res.render('admin/add_product', {
      title,
      desc,
      price,
      categories
     })

    })
   } else {
    const price2 = parseFloat(price).toFixed(2);
    const product = new Product({
     title: title,
     slug: slug,
     desc: desc,
     price: price2,
     category: category,
     image: imageFile
    });
    product.save(err => {
     if (err) return console.log(err);

     mkdirp(`public/product_images/${product._id}`, function (err) {
      return console.log(err);
     });
     mkdirp(`public/product_images/${product._id}/gallery`, function (err) {
      return console.log(err);
     });
     mkdirp(`public/product_images/${product._id}/gallery/thumbs`, function (err) {
      return console.log(err);
     });

     if (imageFile != "") {
      let productImage = req.files.image;
      let path = `public/product_images/${product._id}/imageFile`;
      productImage.mv(path, err => {
       return console.log(err);
      })
     }

     req.flash('success', 'Product is Added!');
     res.redirect('/admin/products');
    });
   }
  });
 }

})


// get edit page
router.get('/edit-page/:id', (req, res) => {

 Page.findById(req.params.id, function (err, page) {
  if (err) return console.log(err);

  res.render('admin/edit_page', {
   title: page.title,
   slug: page.slug,
   content: page.content,
   id: page._id
  })
 })
})

//Post edit page
router.post('/edit-page/:id', (req, res) => {

 req.checkBody('title', 'title must have a value').notEmpty();
 req.checkBody('content', 'Content must have a value').notEmpty();

 var title = req.body.title;
 var content = req.body.content;
 var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
 if (slug == '') { slug = title.replace(/\s+/g, '-').toLowerCase() };
 var id = req.params.id;

 var errors = req.validationErrors();
 if (errors) {
  res.render('admin/edit_page', {
   errors: errors,
   title: title,
   slug: slug,
   content: content,
   id: id
  })
 }
 else {
  Page.findOne({ slug: slug, "_id": { $ne: id } }, (err, page) => {
   if (page) {
    // this flash not working well
    req.flash('notify', 'Page slug exists, choose another.');
    res.render('admin/edit_page', {
     title: title,
     slug: slug,
     content: content,
     id: id
    })
   } else {
    Page.findById(id, function (err, page) {
     if (err) return console.log(err);

     page.title = title;
     page.slug = slug;
     page.content = content;

     page.save(err => {
      if (err) return console.log(err);
      req.flash('success', 'Success!!');
      res.redirect(`/admin/pages/edit-page/${id}`);
     });
    })
   }
  });
 }

})


// get delete page
router.get('/delete-page/:id', (req, res) => {

 Page.findByIdAndRemove(req.params.id, function (err) {
  if (err) return console.log(err);

  req.flash('success', 'Page is deleted!');
  res.redirect('/admin/pages/');
 })
})





//exports
module.exports = router;