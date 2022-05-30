const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const checkOut = new Schema({
    userId: {
        type: Object,
        ref:'User',
        required: true
    },
    time: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('checkOut', checkOut);