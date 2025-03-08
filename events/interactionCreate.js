const { Events, MessageFlags } = require('discord.js');
const config = require('../config.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                
                try {
                    const errorResponse = {
                        content: '⚠️ 명령어 실행 중 오류가 발생했습니다!',
                        flags: MessageFlags.Ephemeral
                    };

                    if (interaction.deferred || interaction.replied) {
                        await interaction.editReply(errorResponse);
                    } else {
                        await interaction.reply(errorResponse);
                    }
                } catch (e) {
                    console.error('응답 전송 중 오류 발생:', e);
                }
            }
        } else if (interaction.isButton()) {
            if (interaction.customId === 'save_close') {
                try {
                    await interaction.update({ content: '티켓을 저장하고 닫습니다.', components: [] });
                    await interaction.channel.delete();
                } catch (error) {
                    console.error('❌ 티켓 저장 및 닫기 중 오류 발생:', error);
                }
            } else if (interaction.customId === 'no_save_close') {
                try {
                    await interaction.update({ content: '티켓을 저장하지 않고 닫습니다.', components: [] });
                    await interaction.channel.delete();
                } catch (error) {
                    console.error('❌ 티켓 닫기 중 오류 발생:', error);
                }
            }
        }
    },
};