const { SlashCommandBuilder, EmbedBuilder, Colors, MessageFlags } = require('discord.js');
const Warning = require('../models/Warning');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('경고제거')
        .setDescription('사용자의 경고를 제거합니다.')
        .addUserOption(option => 
            option.setName('유저')
                .setDescription('경고 제거할 유저')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('횟수')
                .setDescription('제거할 경고 개수')
                .setRequired(true)
                .setMinValue(1))
        .addStringOption(option =>
            option.setName('사유')
                .setDescription('경고 제거 사유')
                .setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(config.adminRoleId)) {
            return interaction.reply({ content: '🚫 **권한이 없습니다.**', flags: MessageFlags.Ephemeral });
        }

        const user = interaction.options.getUser('유저');
        const count = interaction.options.getInteger('횟수');
        const reason = interaction.options.getString('사유');

        let warningData = await Warning.findOne({ userId: user.id });
        if (!warningData || warningData.warnings.length === 0) {
            return interaction.reply({ content: '⚠️ **이 유저에게 경고 기록이 없습니다.**', flags: MessageFlags.Ephemeral });
        }

        warningData.warnings.splice(0, count);
        await warningData.save();

        const embed = new EmbedBuilder()
            .setTitle('✅ 경고 제거')
            .setDescription(`**${user} 님의 경고를 ${count}회 제거했습니다.**`)
            .addFields(
                { name: '⚖️ 관리자', value: `${interaction.user} (${interaction.user.id})`, inline: true },
                { name: '👤 대상', value: `${user} (${user.id})`, inline: true },
                { name: '📝 사유', value: `\`\`\`${reason}\`\`\`` },
                { name: '📊 남은 경고 수', value: `${warningData.warnings.length}회`, inline: true }
            )
            .setColor(Colors.Green)
            .setThumbnail(user.displayAvatarURL());

        const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
        if (logChannel) logChannel.send({ embeds: [embed] });

        interaction.reply({ content: '✅ **경고 제거 완료!**', flags: MessageFlags.Ephemeral });
    },
};
