require('dotenv').config(); // 맨 위에 있어야 함
const noblox = require('noblox.js');
const axios = require('axios');
const config = require('../config.js');

// ✅ 로블록스 로그인
async function loginToRoblox() {
    try {
        await noblox.setCookie(config.ROBLOX_COOKIE);
        console.log('✅ 로블록스 로그인 성공!');
    } catch (error) {
        console.error('❌ 로블록스 로그인 실패:', error);
    }
}

// ✅ 유저 그룹 요청 승인
async function acceptGroupRequest(userId) {
    try {
        await noblox.handleJoinRequest(config.ROBLOX_GROUP_ID, userId, true);
        return true;
    } catch (error) {
        console.error('❌ 그룹 요청 승인 실패:', error);
        return false;
    }
}

// ✅ 유저 그룹 요청 거절
async function declineGroupRequest(userId) {
    try {
        await noblox.handleJoinRequest(config.ROBLOX_GROUP_ID, userId, false);
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

// ✅ CSRF 토큰 가져오기
async function getCSRFToken() {
    const res = await axios.post("https://auth.roblox.com/v2/logout", {}, {
        headers: {
            Cookie: `.ROBLOSECURITY=${config.ROBLOX_COOKIE}`
        },
        validateStatus: () => true
    });
    return res.headers['x-csrf-token'];
}

// ✅ 게임 공개/비공개 설정
async function setGamePublicStatus(isPublic) {
    try {
        const token = await getCSRFToken();
        const universeId = config.ROBLOX_UNIVERSE_ID;

        const response = await axios.patch(
            `https://develop.roblox.com/v1/universes/${universeId}/configuration`,
            {
                isEnabled: isPublic
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': token,
                    'Cookie': `.ROBLOSECURITY=${config.ROBLOX_COOKIE}`
                },
                validateStatus: () => true
            }
        );

        console.log('📦 Roblox 응답:', response.data);
        return response.status === 200;
    } catch (error) {
        console.error('❌ 서버 공개/비공개 실패:', error.response?.data || error.message);
        return false;
    }
}

// ✅ 모듈 내보내기
module.exports = {
    loginToRoblox,
    acceptGroupRequest,
    declineGroupRequest,
    kickGroupMember,
    setGamePublicStatus
};
