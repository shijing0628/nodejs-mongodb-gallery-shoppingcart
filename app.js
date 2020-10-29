const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config/database')
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator')

// connect to db
mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
 console.log('connect to mongodb')
});

//init app
const app = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//public folder setup
app.use(express.static(path.join(__dirname, 'public')));

//set global variant for errors
app.locals.errors = null;


// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())


//express session middleware
app.use(session({
 secret: 'keyboard cat',
 resave: true,
 saveUninitialized: true,

 // cookie: { secure: true }
}))





//express validator, if get console error, install previous version: npm install express-validator@5.3.0
app.use(expressValidator({
 errorFormatter: function (param, msg, value) {
  let namespace = param.split('.'),
   root = namespace.shift(),
   formParam = root;
  while (namespace.length) {
   formParam += '[' + namespace.shift() + ']';
  }
  return {
   param: formParam,
   msg: msg,
   value: value
  };
 }
}))

// express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
 res.locals.messages = require('express-messages')(req, res);
 next();
});



//set routes
const pages = require('./routes/pages');
const adminPages = require('./routes/admin_pages');
const adminCategories = require('./routes/admin_categories');
app.use('/', pages);
app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);



//start a server
var port = 3000;
app.listen(port, function () {
 console.log(`server start at port ${port}`);
})