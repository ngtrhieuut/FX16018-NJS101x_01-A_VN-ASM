const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  idStaff: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  doB: {
    type: Date,
    required: true
  },
  salaryScale: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  startShift: {
    type: String,
    required: true
  },
  endShift: {
    type: String,
    required: true
  },
  annualLeave: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  status: [{status: {type: Boolean}}],
  vaccinated: [{count: {type: Number}, vaccinateName: {type: String}, time: {type: Date}}],
  covidCheck: {
    type: Boolean,
  },
  isManager: {
    type: Boolean,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('User', userSchema);
