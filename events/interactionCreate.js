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
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ 
                        content: '⚠️ 명령어 실행 중 오류가 발생했습니다!', 
                        ephemeral: true 
                    });
                } else {
                    await interaction.reply({ 
                        content: '⚠️ 명령어 실행 중 오류가 발생했습니다!', 
                        ephemeral: true 
                    });
                }
            }
        } else if (interaction.isButton()) {
            if (interaction.customId === 'save_close') {
                // 저장하고 닫기 로직 추가
                try {
                    await interaction.update({ content: '티켓을 저장하고 닫습니다.', components: [] });
                    await interaction.channel.delete();
                } catch (error) {
                    console.error('❌ 티켓 저장 및 닫기 중 오류 발생:', error);
                }
            } else if (interaction.customId === 'no_save_close') {
                // 저장 안 하고 닫기 로직 추가
                try {
                    await interaction.update({ content: '티켓을 저장하지 않고 닫습니다.', components: [] });
                    await interaction.channel.delete();
                } catch (error) {
                    console.error('❌ 티켓 닫기 중 오류 발생:', error);
                }
            }
        }
    }
};