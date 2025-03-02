const { SlashCommandBuilder, EmbedBuilder, Colors, MessageFlags } = require('discord.js');
const Warning = require('../models/Warning');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('경고조회')
        .setDescription('사용자의 경고 기록을 조회합니다.')
        .addUserOption(option => 
            option.setName('유저')
                .setDescription('경고 기록을 조회할 유저')
                .setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser('유저');

        let warningData = await Warning.findOne({ userId: user.id });
        if (!warningData || warningData.warnings.length === 0) {
            return interaction.reply({ content: '⚠️ **이 유저에게 경고가 없습니다.**', flags: MessageFlags.Ephemeral });
        }

        const latestWarning = warningData.warnings[warningData.warnings.length - 1];

        const embed = new EmbedBuilder()
            .setTitle('📋 경고 기록 조회')
            .setDescription(`**${user} 님의 경고 기록입니다.**`)
            .addFields(
                { name: '👤 대상', value: `${user} (${user.id})`, inline: true },
                { name: '📊 총 경고 수', value: `${warningData.warnings.length}회`, inline: true },
                { name: '📝 최근 경고 사유', value: `\`\`\`${latestWarning.reason}\`\`\`` }
            )
            .setColor(Colors.Orange)
            .setThumbnail(user.displayAvatarURL());

        interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};
