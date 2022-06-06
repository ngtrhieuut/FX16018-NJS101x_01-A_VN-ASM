const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://ngtrhieuut:Alo113114115@ngtrhieuut.2ktcr.mongodb.net/employeeTracker';

const app = express();
const store = new MongoDBStore({ //create store MONGODB use session
  uri: MONGODB_URI,
  collection: 'session'
});
const csrfProtection = csrf();

const storage = multer.diskStorage({ //create store for images upload
  destination: function (req, file, cb) {
    cb(null, 'public/images')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now()
    cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname)
  }
})

//Use EJS as Template Engine
app.set('view engine', 'ejs');
app.set('views', 'views');

const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');

//use middleware 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: storage }).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({secret: 'my secret', resave: false, saveUninitialized: false, store: store})
);
app.use(csrfProtection);
app.use(flash());

//add global condition for checking manager or staff and checking loggin status
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      res.locals.isLoggIn = req.session.isLoggedIn;
      res.locals.isManager = req.user.isManager;
      res.locals.csrfToken = req.csrfToken();
      next();
    })
    .catch(err => {
      throw new Error(err);
    });
});

app.use(userRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((err, req, res, next) => {
  console.log(err)
  res.status(500).render('500', { pageTitle: 'Error!!!', path: '/500' });
})

mongoose
  .connect(
    MONGODB_URI
  )
  .then(result => {
    app.listen(process.env.PORT || 8000, '0.0.0.0', () => { //deploy heroku with ip '0.0.0.0'
      console.log('Server is running.');
    });
  })
  .catch(err => {
    console.log(err);
  });
