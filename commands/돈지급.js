const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('돈지급')
        .setDescription('사용자에게 돈을 지급합니다.')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('돈을 지급할 사용자의 로블록스 사용자 이름')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('지급할 돈의 양')
                .setRequired(true)),
    async execute(interaction) {
        const username = interaction.options.getString('username');
        const amount = interaction.options.getInteger('amount');

        try {
            const response = await axios.post('https://your-roblox-game-server-endpoint', {
                username: username,
                amount: amount,
                action: 'add'
            });
            if (response.data.success) {
                await interaction.reply(`${username}에게 ${amount} 돈을 지급했습니다.`);
            } else {
                await interaction.reply(`돈 지급에 실패했습니다: ${response.data.message}`);
            }
        } catch (error) {
            console.error(error);
            await interaction.reply('돈 지급에 실패했습니다.');
        }
    },
};