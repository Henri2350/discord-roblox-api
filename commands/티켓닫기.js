const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('티켓닫기')
        .setDescription('현재 티켓을 닫습니다.'),

    async execute(interaction) {
        const member = interaction.member;

        // ✅ 사용자가 adminRoleId 역할을 가지고 있는지 확인
        if (!member.roles.cache.has(config.adminRoleId)) {
            return interaction.reply({ content: '🚫 이 명령어를 사용할 권한이 없습니다.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('🛑 티켓을 닫으시겠습니까?')
            .setDescription('아래 버튼을 선택하세요.')
            .setColor('Red');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('save_close')
                .setLabel('저장하고 닫기')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('no_save_close')
                .setLabel('저장 안 하고 닫기')
                .setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};