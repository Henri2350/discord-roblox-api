const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('돈지급')
    .setDescription('로블록스 유저에게 돈을 지급합니다')
    .addStringOption(option =>
      option.setName('유저명').setDescription('로블록스 유저 이름').setRequired(true))
    .addIntegerOption(option =>
      option.setName('금액').setDescription('지급할 금액').setRequired(true)),

  async execute(interaction) {
    const username = interaction.options.getString('유저명');
    const amount = interaction.options.getInteger('금액');

    try {
      await axios.post(`http://localhost:${process.env.API_PORT}/give-money`, {
        username,
        amount
      });

      await interaction.reply(`✅ **${username}**에게 **${amount}원**을 지급했습니다!`);
    } catch (err) {
      console.error(err);
      await interaction.reply(`❌ 지급 실패: ${err.response?.data || '서버 오류'}`);
    }
  }
};
