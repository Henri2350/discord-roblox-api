const mongoose = require('mongoose');

const groupRequestSchema = new mongoose.Schema({
    username: { type: String, required: true }, // 로블록스 사용자명
    userId: { type: String, required: true }, // 로블록스 사용자 ID
    discordId: { type: String, required: true }, // 디스코드 유저 ID
    status: { type: String, enum: ['pending', 'accepted', 'denied', 'kicked'], default: 'pending' }, // 요청 상태
    requestedAt: { type: Date, default: Date.now } // 요청 날짜
});

module.exports = mongoose.model('GroupRequest', groupRequestSchema);