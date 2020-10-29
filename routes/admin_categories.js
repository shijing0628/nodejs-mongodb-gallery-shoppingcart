const express = require('express');
const router = express.Router();

//get category model
const Category = require('../modals/cateogry');

// get category index from Database
router.get('/', (req, res) => {

 Category.find((err, categories) => {
  if (err) console.log(err);
  res.render('admin/categories', {
   categories
  })
 })

})

// get add category
router.get('/add-category', (req, res) => {
 const title = '';
 res.render('admin/add_category', {
  title
 })
})

//Post add category
router.post('/add-category', (req, res) => {
 req.checkBody('title', 'title must have a value').notEmpty();
 var title = req.body.title;
 var slug = title.replace(/\s+/g, '-').toLowerCase()
 var errors = req.validationErrors();
 if (errors) {

  res.render('admin/add_category', {
   errors: errors,
   title: title
  })
 }
 else {
  Category.findOne({ slug: slug }, (err, category) => {
   if (category) {
    req.flash('danger', 'category title exists, choose another');
    res.render('admin/add_category', {
     title: title
    })
   } else {
    var category = new Category({
     title: title,
     slug: slug
    });

    category.save(err => {
     if (err) return console.log(err);

     req.flash('success', 'category Added!').toString();
     res.redirect('/admin/categories');
    });
   }
  });
 }

})



// get edit category
router.get('/edit-category/:id', (req, res) => {

 Category.findById(req.params.id, function (err, category) {
  if (err) return console.log(err);

  res.render('admin/edit_category', {
   title: category.title,
   id: category._id
  })
 })
})

//Post edit category
router.post('/edit-category/:id', (req, res) => {

 req.checkBody('title', 'title must have a value').notEmpty();

 var title = req.body.title;
 var slug = title.replace(/\s+/g, '-').toLowerCase();

 var id = req.params.id;

 var errors = req.validationErrors();
 if (errors) {
  res.render('admin/edit_category', {
   errors: errors,
   title: title,
   slug: slug,
   id: id
  })
 }
 else {
  Category.findOne({ slug: slug, "_id": { $ne: id } }, (err, category) => {
   if (category) {
    // this flash not working well
    req.flash('danger', 'category  exists, choose another.');
    res.render('admin/edit_category', {
     title: title,
     id: id
    })
   } else {
    Category.findById(id, function (err, category) {
     if (err) return console.log(err);

     category.title = title;
     category.slug = slug;

     category.save(err => {
      if (err) return console.log(err);
      req.flash('success', 'category edit Success!!');
      res.redirect(`/admin/categories/edit-category/${id}`);
     });
    })
   }
  });
 }
})


// get delete category
router.get('/delete-category/:id', (req, res) => {
 Category.findByIdAndRemove(req.params.id, function (err) {
  if (err) return console.log(err);

  req.flash('success', 'category is deleted!');
  res.redirect('/admin/categories/');
 })
})





//exports
module.exports = router;