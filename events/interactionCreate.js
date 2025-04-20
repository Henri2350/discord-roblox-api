const { MessageFlags, EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../config.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ 
                    content: '⚠️ 명령어 실행 중 오류가 발생했습니다!', 
                    flags: MessageFlags.Ephemeral
                });
            }
        } else if (interaction.isButton()) {
            if (interaction.customId === 'save_close') {
                // 저장하고 닫기 로직 추가
                try {
                    if (interaction.replied || interaction.deferred) {
                        console.log('이미 응답된 상호작용입니다.');
                        return;
                    }

                    await interaction.deferUpdate(); // 상호작용 연장
                    // 티켓 저장 로직 추가 (예: 데이터베이스 저장)
                    console.log('티켓 저장 로직 실행 중...');
                    
                    await interaction.channel.delete(); // 채널 삭제
                    console.log('티켓 채널 삭제 완료');
                } catch (error) {
                    console.error('❌ 티켓 저장 및 닫기 중 오류 발생:', error);
                    if (!interaction.replied) {
                        await interaction.followUp({ 
                            content: '티켓 저장 및 닫기 중 오류가 발생했습니다. 다시 시도해 주세요.', 
                            ephemeral: true 
                        });
                    }
                }
            } else if (interaction.customId === 'no_save_close') {
                // 저장 안 하고 닫기 로직 추가
                try {
                    if (interaction.replied || interaction.deferred) {
                        console.log('이미 응답된 상호작용입니다.');
                        return;
                    }

                    await interaction.deferUpdate(); // 상호작용 연장
                    await interaction.channel.delete(); // 채널 삭제
                    console.log('티켓 채널 삭제 완료');
                } catch (error) {
                    console.error('❌ 티켓 닫기 중 오류 발생:', error);
                    if (!interaction.replied) {
                        await interaction.followUp({ 
                            content: '티켓 닫기 중 오류가 발생했습니다. 다시 시도해 주세요.', 
                            ephemeral: true 
                        });
                    }
                }
            }
        }
    }
};