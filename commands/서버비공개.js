const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setGamePublicStatus } = require('../utils/roblox');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('서버비공개')
        .setDescription('로블록스 서버를 비공개 상태로 변경합니다.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        // 명령어를 실행한 사용자가 권한이 있는지 확인
        if (!config.AUTHORIZED_USERS.includes(interaction.user.id)) {
            return interaction.editReply('⛔ 이 명령어를 실행할 권한이 없습니다.');
        }
        
        try {
            // 로블록스 서버 비공개 상태로 변경 API 호출
            const success = await setGamePublicStatus(false);
            
            if (success) {
                await interaction.editReply('✅ 서버가 비공개 상태로 변경되었습니다.');
                
                // 로그 채널에 알림
                const logChannel = interaction.client.channels.cache.get(config.LOG_CHANNEL_ID);
                if (logChannel) {
                    await logChannel.send(`🔒 ${interaction.user.tag}님이 서버를 비공개 상태로 변경했습니다.`);
                }
            } else {
                await interaction.editReply('❌ 서버 상태 변경에 실패했습니다. 로그를 확인해주세요.');
            }
        } catch (error) {
            console.error('❌ 서버 비공개 설정 중 오류 발생:', error);
            await interaction.editReply('❌ 서버 비공개 설정 중 오류가 발생했습니다. 로그를 확인해주세요.');
        }
    },
};