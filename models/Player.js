const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    username: { type: String, required: true },
    balance: { type: Number, required: true },
    vehicles: { type: [String], required: true }
});

module.exports = mongoose.model('Player', playerSchema);