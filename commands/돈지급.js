const { SlashCommandBuilder, MessageFlags } = require('discord.js');
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
        await interaction.deferReply(); // 응답 지연
        
        const username = interaction.options.getString('username');
        const amount = interaction.options.getInteger('amount');

        try {
            const response = await axios.post('http://localhost:3001/roblox-endpoint', {
                username: username,
                amount: amount,
                action: 'add'
            });
            
            if (response.data.success) {
                await interaction.editReply(`${username}에게 ${amount} 돈을 지급했습니다.`);
            } else {
                await interaction.editReply(`돈 지급에 실패했습니다: ${response.data.message}`);
            }
        } catch (error) {
            console.error('돈 지급 중 오류 발생:', error);
            await interaction.editReply({ 
                content: '⚠️ 돈 지급에 실패했습니다.',
                flags: MessageFlags.Ephemeral 
            });
        }
    },
};