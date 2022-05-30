const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const checkIn = new Schema({
    userId: {
        type: Object,
        ref:'User',
        required: true
    },
    time: {
        type: String,
        required: true
    },
    workLocation: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('checkIn', checkIn);