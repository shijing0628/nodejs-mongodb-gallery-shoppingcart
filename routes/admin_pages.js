const express = require('express');
const router = express.Router();

//get page model
const Page = require('../modals/page')

// get page index from Database
router.get('/', (req, res) => {
 Page.find({}).sort({ sorting: 1 }).exec((err, pages) => {
  res.render('admin/pages', {
   pages: pages
  })
 })
})

// get add page
router.get('/add-page', (req, res) => {
 const title = '';
 const slug = '';
 const content = '';
 res.render('admin/add_page', {
  title,
  slug,
  content
 })
})

// Post add page: check validation, check if slug has already exist, otherwise generate a new page
router.post('/add-page', (req, res) => {
 req.checkBody('title', 'title must have a value').notEmpty();
 req.checkBody('content', 'Content must have a value').notEmpty();

 let { title, content } = req.body;
 let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
 if (slug == '') { slug = title.replace(/\s+/g, '-').toLowerCase() };

 const errors = req.validationErrors();
 if (errors) {
  res.render('admin/add_page', {
   errors,
   title,
   slug,
   content
  })
 }
 else {
  Page.findOne({ slug: slug }, (err, page) => {
   if (page) {
    req.flash('danger', 'Page slug existes, choose another');
    res.render('admin/add_page', {
     title,
     slug,
     content
    })
   } else {
    const page = new Page({
     title,
     slug,
     content,
     sorting: 100
    });
    page.save(err => {
     if (err) return console.log(err);
     req.flash('success', 'Page Added!');
     res.redirect('/admin/pages');
    });
   }
  });
 }

})


// post reordered pages to Database
router.post('/reorder-pages', (req, res) => {

 // let ids = req.body['id[]'];
 // let count = 0;

 // for (let i = 0; i < ids.length; i++) {
 //  let id = ids[i];
 //  count++;
 //  (function (count) {

 //   Page.findById(id, (err, page) => {
 //    page.sorting = count;
 //    page.save(err => {
 //     if (err) return console.log(err);
 //    })
 //   })
 //  })(count);
 // }

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