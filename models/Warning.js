const mongoose = require('mongoose');

const warningSchema = new mongoose.Schema({
    userId: String,
    warnings: [{
        reason: String,
        date: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('Warning', warningSchema);
