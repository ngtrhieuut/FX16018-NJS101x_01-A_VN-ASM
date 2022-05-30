const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const temperature = new Schema({
    userId: {
        type: Object,
        ref:'User',
        required: true
    },
    time: {
        type: String,
        required: true
    },
    temperature: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Temperature', temperature);