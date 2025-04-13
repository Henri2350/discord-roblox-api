const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

/**
 * 게임 가시성 설정을 개별적으로 변경하는 함수
 * @param {string} cookie ROBLOSECURITY 쿠키
 * @param {string} xcsrfToken CSRF 토큰
 * @param {number} universeId 유니버스 ID
 * @param {Object} settings 변경할 설정 객체
 * @returns {Promise<Object>} 응답 결과
 */
async function updateGameSetting(cookie, xcsrfToken, universeId, settings) {
    try {
        const response = await axios.patch(
            `https://develop.roblox.com/v1/universes/${universeId}/configuration`,
            settings,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `.ROBLOSECURITY=${cookie}`,
                    'X-CSRF-TOKEN': xcsrfToken
                }
            }
        );
        return { success: true, data: response.data };
    } catch (error) {
        console.error('설정 변경 오류:', error.message);
        
        // 오류 응답에서 세부 정보 추출
        let errorDetails = '알 수 없는 오류';
        if (error.response && error.response.data && error.response.data.errors) {
            errorDetails = error.response.data.errors.map(err => err.message || err.code || JSON.stringify(err)).join(', ');
        }
        
        return { 
            success: false, 
            error: error.message, 
            details: errorDetails,
            status: error.response?.status
        };
    }
}

/**
 * 게임을 비공개로 설정하는 함수
 * @param {string} cookie ROBLOSECURITY 쿠키
 * @param {string} xcsrfToken CSRF 토큰
 * @param {number} universeId 유니버스 ID
 * @returns {Promise<Object>} 결과 객체
 */
async function setGamePrivate(cookie, xcsrfToken, universeId) {
    try {
        // 쿠키와 토큰 유효성 검사
        if (!cookie || !xcsrfToken) {
            return { 
                success: false, 
                error: '인증 정보가 없습니다', 
                details: '쿠키 또는 CSRF 토큰이 누락되었습니다' 
            };
        }

        // 각 설정을 개별적으로 변경
        const settings = [
            { isPublic: false },
            { isForSale: false }  // 비공개 시 판매도 비활성화
        ];

        const results = [];
        let allSuccess = true;

        // 각 설정을 순차적으로 적용
        for (const setting of settings) {
            const result = await updateGameSetting(cookie, xcsrfToken, universeId, setting);
            results.push({ setting, result });
            
            if (!result.success) {
                allSuccess = false;
                // 중요: 실패 시 세부 정보 기록
                console.error(`설정 ${JSON.stringify(setting)} 변경 실패:`, result.details);
            }
        }

        return {
            success: allSuccess,
            message: allSuccess ? '게임이 성공적으로 비공개로 설정되었습니다' : '일부 설정 변경에 실패했습니다',
            results
        };
    } catch (error) {
        console.error('게임 비공개 설정 중 오류 발생:', error);
        return {
            success: false,
            error: error.message,
            details: '예상치 못한 오류가 발생했습니다'
        };
    }
}

/**
 * CSRF 토큰을 가져오는 함수
 * @param {string} cookie ROBLOSECURITY 쿠키
 * @returns {Promise<string>} CSRF 토큰
 */
async function getCSRFToken(cookie) {
    try {
        const response = await axios.post(
            'https://auth.roblox.com/v2/logout',
            {},
            {
                headers: {
                    'Cookie': `.ROBLOSECURITY=${cookie}`
                }
            }
        );
        return '';  // 정상적으로는 여기에 도달하지 않음
    } catch (error) {
        // 로그아웃은 실패하지만 응답 헤더에서 x-csrf-token을 가져옴
        if (error.response && error.response.headers && error.response.headers['x-csrf-token']) {
            return error.response.headers['x-csrf-token'];
        }
        throw new Error('CSRF 토큰을 가져올 수 없습니다: ' + (error.message || '알 수 없는 오류'));
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('서버비공개')
        .setDescription('게임을 비공개로 설정합니다'),

    async execute(interaction) {
        // 상호작용 지연 응답
        await interaction.deferReply({ ephemeral: true });

        try {
            // .env 파일에서 쿠키 가져오기
            const cookie = process.env.ROBLOX_COOKIE;
            if (!cookie) {
                return await interaction.editReply({ 
                    content: '⚠️ 환경 변수에서 ROBLOX_COOKIE를 찾을 수 없습니다. .env 파일을 확인해주세요.' 
                });
            }
            
            // 유니버스 ID 설정 (필요에 따라 변경하거나 .env에서 가져올 수 있음)
            const universeId = process.env.UNIVERSE_ID || 4063004005;
            
            // CSRF 토큰 가져오기
            const xcsrfToken = await getCSRFToken(cookie);
            if (!xcsrfToken) {
                return await interaction.editReply({ 
                    content: '⚠️ CSRF 토큰을 가져오는데 실패했습니다. 쿠키가 유효한지 확인해주세요.' 
                });
            }
            
            // 게임을 비공개로 설정
            const result = await setGamePrivate(cookie, xcsrfToken, universeId);
            
            if (result.success) {
                const embed = new EmbedBuilder()
                    .setTitle('✅ 게임 비공개 설정 성공')
                    .setDescription(`게임이 성공적으로 비공개로 설정되었습니다.`)
                    .setColor('#00FF00')
                    .setTimestamp();
                
                await interaction.editReply({ embeds: [embed] });
            } else {
                // 실패 시 상세 정보 표시
                const embed = new EmbedBuilder()
                    .setTitle('❌ 게임 비공개 설정 실패')
                    .setDescription(`게임 비공개 설정에 실패했습니다.`)
                    .addFields(
                        { name: '오류', value: result.error || '알 수 없는 오류' },
                        { name: '세부 정보', value: result.details || '없음' }
                    )
                    .setColor('#FF0000')
                    .setTimestamp();
                
                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('명령어 실행 중 오류:', error);
            
            const embed = new EmbedBuilder()
                .setTitle('⚠️ 오류 발생')
                .setDescription('명령어 실행 중 예상치 못한 오류가 발생했습니다.')
                .addFields({ name: '오류 메시지', value: error.message || '알 수 없는 오류' })
                .setColor('#FF0000')
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed] });
        }
    },
};