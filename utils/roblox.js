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

// ✅ 게임 설정 가져오기
async function getGameConfiguration() {
    const universeId = config.ROBLOX_UNIVERSE_ID;
    const response = await axios.get(`https://develop.roblox.com/v1/universes/${universeId}/configuration`, {
        headers: {
            Cookie: `.ROBLOSECURITY=${config.ROBLOX_COOKIE}`
        }
    });
    return response.data;
}

// ✅ 게임 설정 저장하기
async function saveGameConfiguration(updatedSettings) {
    const token = await getCSRFToken();
    const universeId = config.ROBLOX_UNIVERSE_ID;

    const response = await axios.patch(
        `https://develop.roblox.com/v1/universes/${universeId}/configuration`,
        updatedSettings,
        {
            headers: {
                'Content-Type': 'application/json',
                'x-csrf-token': token,
                'Cookie': `.ROBLOSECURITY=${config.ROBLOX_COOKIE}`
            },
            validateStatus: () => true
        }
    );

    if (response.status === 200) {
        return { success: true, data: response.data };
    } else {
        const errorDetails = response.data?.errors?.map(e => e.message).join(', ') || '알 수 없는 오류';
        return { success: false, error: errorDetails };
    }
}

// ✅ 게임 공개/비공개 설정 (최종 저장 포함)
async function setGamePublicStatus(isPublic) {
    try {
        const currentSettings = await getGameConfiguration();

        const updatedSettings = {
            ...currentSettings,
            isPublic: isPublic,
            isForSale: isPublic,
            privateServerPrice: 0,
            allowPrivateServers: true
        };

        const result = await saveGameConfiguration(updatedSettings);
        if (result.success) {
            console.log(`✅ 게임 ${isPublic ? '공개' : '비공개'}로 설정 완료`);
            return true;
        } else {
            console.error('❌ 설정 저장 실패:', result.error);
            return false;
        }
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
    setGamePublicStatus,
    getCSRFToken,
    getGameConfiguration,
    saveGameConfiguration
};
