const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const annualLeaveSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: true,
    },
    startHours: {
        type: String,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    endHours: {
        type: String,
        required: true
    },
    offComment: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('AnnualLeave', annualLeaveSchema);