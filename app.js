const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

//Use EJS as Template Engine
app.set('view engine', 'ejs');
app.set('views', 'views');

const userRoutes = require('./routes/user');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('629424eb497d5eda38510d26')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use(userRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    'mongodb+srv://ngtrhieuut:Alo113114115@ngtrhieuut.2ktcr.mongodb.net/employeeTracker?retryWrites=true&w=majority'
  )
  .then(result => {
    //save example user into mongoDB
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          idStaff: 'FX16018',
          name: 'Nguyen Trung Hieu',
          doB: '09/08/1997',
          salaryScale: '1.2',
          startDate: '01/01/2022',
          department: 'IT',
          startShift: '09:00',
          endShift: '17:00',
          annualLeave: '15',
          image: 'https://bizweb.dktcdn.net/100/392/388/products/z2805461259109-3040f96e1a6423f176aca350875cf765.jpg?v=1634188061233',
          status: [],
          vaccinated: [],
          covidCheck: false,
        });
        user.save()
      }
    })
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
