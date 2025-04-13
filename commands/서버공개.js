const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

// 설정 개별 변경 함수
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
        let errorDetails = '알 수 없는 오류';
        if (error.response && error.response.data?.errors) {
            errorDetails = error.response.data.errors.map(err => err.message || JSON.stringify(err)).join(', ');
        }
        return {
            success: false,
            error: error.message,
            details: errorDetails,
            status: error.response?.status
        };
    }
}

// 게임 가시성 설정 변경 함수
async function setGameVisibility(cookie, xcsrfToken, universeId, isPublic) {
    try {
        if (!cookie || !xcsrfToken) {
            return {
                success: false,
                error: '인증 정보 누락',
                details: '쿠키 또는 CSRF 토큰이 없습니다.'
            };
        }

        const settings = [];

        if (isPublic) {
            settings.push({ isForSale: true });
            settings.push({ price: 0 }); // ✅ 필수
            settings.push({ allowPrivateServers: true });
            settings.push({ privateServerPrice: 0 });
            settings.push({ isPublic: true }); // ✅ 마지막에 공개
        } else {
            settings.push({ isPublic: false }); // ✅ 비공개 먼저
            settings.push({ isForSale: false });
        }

        const results = [];
        let allSuccess = true;

        for (const setting of settings) {
            const result = await updateGameSetting(cookie, xcsrfToken, universeId, setting);
            results.push({ setting, result });

            if (!result.success) {
                allSuccess = false;
                console.error(`설정 ${JSON.stringify(setting)} 변경 실패:`, result.details);
            }
        }

        return {
            success: allSuccess,
            message: allSuccess ? '모든 설정 변경 성공' : '일부 설정 실패',
            results
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            details: '예상치 못한 오류 발생'
        };
    }
}

// CSRF 토큰 요청
async function getCSRFToken(cookie) {
    try {
        await axios.post('https://auth.roblox.com/v2/logout', {}, {
            headers: {
                'Cookie': `.ROBLOSECURITY=${cookie}`
            }
        });
        return '';
    } catch (error) {
        if (error.response?.headers['x-csrf-token']) {
            return error.response.headers['x-csrf-token'];
        }
        throw new Error('CSRF 토큰을 가져올 수 없습니다: ' + (error.message || '알 수 없음'));
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('서버공개')
        .setDescription('게임의 공개/비공개 설정을 변경합니다')
        .addBooleanOption(option =>
            option.setName('공개여부')
                .setDescription('true: 공개 / false: 비공개')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true }); // flags: 64 도 가능

        try {
            const isPublic = interaction.options.getBoolean('공개여부');
            const cookie = process.env.ROBLOX_COOKIE;
            const universeId = parseInt(process.env.UNIVERSE_ID);

            if (!cookie || !universeId) {
                return await interaction.editReply({
                    content: '❗ .env 파일의 ROBLOX_COOKIE 또는 UNIVERSE_ID가 설정되지 않았습니다.'
                });
            }

            const xcsrfToken = await getCSRFToken(cookie);

            if (!xcsrfToken) {
                return await interaction.editReply({
                    content: '❗ CSRF 토큰을 가져오는 데 실패했습니다.'
                });
            }

            const result = await setGameVisibility(cookie, xcsrfToken, universeId, isPublic);

            if (result.success) {
                const embed = new EmbedBuilder()
                    .setTitle('✅ 게임 설정 변경 완료')
                    .setDescription(`게임이 **${isPublic ? '공개' : '비공개'}**로 성공적으로 설정되었습니다.`)
                    .setColor('#00CC66')
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                    .setTitle('❌ 게임 설정 실패')
                    .setDescription(`**${isPublic ? '공개' : '비공개'}** 설정에 실패했습니다.`)
                    .addFields(
                        { name: '에러 메시지', value: result.error || '알 수 없음' },
                        { name: '세부 정보', value: result.details || '없음' }
                    )
                    .setColor('#FF0000')
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            console.error('명령 실행 중 오류:', error);
            const embed = new EmbedBuilder()
                .setTitle('⚠️ 오류 발생')
                .setDescription('명령어 실행 중 예기치 못한 오류가 발생했습니다.')
                .addFields({ name: '오류', value: error.message || '알 수 없음' })
                .setColor('#FF0000')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    },
};
