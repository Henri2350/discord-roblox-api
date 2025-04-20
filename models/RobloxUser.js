const mongoose = require('mongoose');

const RobloxUserSchema = new mongoose.Schema({
    robloxUsername: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 }
});

module.exports = mongoose.model('RobloxUser', RobloxUserSchema);
