const { SlashCommandBuilder } = require('discord.js');
const { setGamePublicStatus } = require('../utils/roblox');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('서버공개')
    .setDescription('로블록스 게임을 공개 상태로 전환합니다.'),
  async execute(interaction) {
    const success = await setGamePublicStatus(true);
    if (success) {
      await interaction.reply('✅ 서버가 **공개 상태**로 전환되었습니다.');
    } else {
      await interaction.reply('❌ 서버 공개 설정에 실패했습니다.');
    }
  },
};
