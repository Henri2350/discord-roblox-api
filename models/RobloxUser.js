const mongoose = require('mongoose');

const robloxUserSchema = new mongoose.Schema({
  robloxUsername: String,
  robloxUserId: Number,
  balance: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('RobloxUser', robloxUserSchema);
