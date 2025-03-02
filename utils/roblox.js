const noblox = require('noblox.js');
const config = require('../config.js');

async function loginToRoblox() {
    try {
        await noblox.setCookie(config.ROBLOX_COOKIE);
        console.log('✅ 로블록스 로그인 성공!');
    } catch (error) {
        console.error('❌ 로블록스 로그인 실패:', error);
    }
}

// ✅ 유저 그룹 요청 승인 (함수 변경됨)
async function acceptGroupRequest(userId) {
    try {
        await noblox.handleJoinRequest(config.ROBLOX_GROUP_ID, userId, true); // ✅ 변경된 함수
        return true;
    } catch (error) {
        console.error('❌ 그룹 요청 승인 실패:', error);
        return false;
    }
}

// ✅ 유저 그룹 요청 거절
async function declineGroupRequest(userId) {
    try {
        await noblox.handleJoinRequest(config.ROBLOX_GROUP_ID, userId, false); // ✅ 변경된 함수
        return true;
    } catch (error) {
        console.error('❌ 그룹 요청 거절 실패:', error);
        return false;
    }
}

// ✅ 유저 그룹 추방
async function kickGroupMember(userId) {
    try {
        await noblox.exile(config.ROBLOX_GROUP_ID, userId);
        return true;
    } catch (error) {
        console.error('❌ 그룹 추방 실패:', error);
        return false;
    }
}

module.exports = { loginToRoblox, acceptGroupRequest, declineGroupRequest, kickGroupMember };