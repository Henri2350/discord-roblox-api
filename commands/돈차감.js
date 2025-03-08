const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('돈차감')
        .setDescription('사용자의 돈을 차감합니다.')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('돈을 차감할 사용자의 로블록스 사용자 이름')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('차감할 돈의 양')
                .setRequired(true)),
    async execute(interaction) {
        const username = interaction.options.getString('username');
        const amount = interaction.options.getInteger('amount');

        try {
            const response = await axios.post('https://your-roblox-game-server-endpoint', {
                username: username,
                amount: amount,
                action: 'subtract'
            });
            if (response.data.success) {
                await interaction.reply(`${username}의 ${amount} 돈을 차감했습니다.`);
            } else {
                await interaction.reply(`돈 차감에 실패했습니다: ${response.data.message}`);
            }
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: '돈 차감에 실패했습니다.', ephemeral: true });
            } else {
                await interaction.reply({ content: '돈 차감에 실패했습니다.', ephemeral: true });
            }
        }
    },
};