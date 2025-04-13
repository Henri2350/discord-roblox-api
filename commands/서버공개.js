const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../config.js');

async function setGameVisibility(universeId, isPublic) {
    try {
        // API 엔드포인트
        const url = `https://develop.roblox.com/v1/universes/${universeId}/configuration`;
        
        // 요청 헤더
        const headers = {
            'Content-Type': 'application/json',
            'Cookie': `.ROBLOSECURITY=${config.ROBLOX_COOKIE}`,
            'X-CSRF-TOKEN': await getCSRFToken()
        };
        
        // 요청 데이터 (isPublic 값에 따라 달라짐)
        const data = {
            allowPrivateServers: true,  // 기본값 유지
            privateServerPrice: 0,      // 기본값 유지
            isForSale: true,            // 기본값 유지
            isPublic: isPublic          // 공개 여부 설정
        };
        
        // PATCH 요청 보내기
        const response = await axios.patch(url, data, { headers });
        return response.status === 200;
    } catch (error) {
        console.error('게임 공개 설정 변경 실패:', error);
        return false;
    }
}

// CSRF 토큰 가져오기
async function getCSRFToken() {
    try {
        const response = await axios.post('https://auth.roblox.com/v2/logout', {}, {
            headers: {
                'Cookie': `.ROBLOSECURITY=${config.ROBLOX_COOKIE}`
            }
        });
        return response.headers['x-csrf-token'];
    } catch (error) {
        // 401 에러가 발생하면 CSRF 토큰이 헤더에 포함됨
        if (error.response && error.response.status === 403) {
            return error.response.headers['x-csrf-token'];
        }
        throw error;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('서버공개')
        .setDescription('로블록스 서버를 공개로 설정합니다.'),

    async execute(interaction) {
        const member = interaction.member;

        // 관리자 권한 확인
        if (!member.roles.cache.has(config.adminRoleId)) {
            return interaction.reply({ content: '🚫 이 명령어를 사용할 권한이 없습니다.', ephemeral: true });
        }

        // 로딩 메시지 표시
        await interaction.deferReply();

        try {
            const success = await setGameVisibility(config.UNIVERSE_ID, true);
            
            if (success) {
                return interaction.editReply(`✅ 로블록스 서버가 공개로 설정되었습니다!`);
            } else {
                return interaction.editReply({ content: `❌ 서버 공개 설정에 실패했습니다.` });
            }
        } catch (error) {
            console.error('서버 공개 설정 오류:', error);
            return interaction.editReply({ content: `❌ 오류가 발생했습니다: ${error.message}` });
        }
    }
};
