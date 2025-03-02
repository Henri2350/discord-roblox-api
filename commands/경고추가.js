const { SlashCommandBuilder, EmbedBuilder, Colors, MessageFlags } = require('discord.js');
const Warning = require('../models/Warning');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('경고추가')
        .setDescription('사용자에게 경고를 부여합니다.')
        .addUserOption(option => 
            option.setName('유저')
                .setDescription('경고할 유저')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('개수')
                .setDescription('추가할 경고 개수')
                .setRequired(true)
                .setMinValue(1))
        .addStringOption(option =>
            option.setName('사유')
                .setDescription('경고 사유')
                .setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(config.adminRoleId)) {
            return interaction.reply({ content: '🚫 **권한이 없습니다.**', flags: MessageFlags.Ephemeral });
        }

        const user = interaction.options.getUser('유저');
        const count = interaction.options.getInteger('개수');
        const reason = interaction.options.getString('사유');

        let warningData = await Warning.findOne({ userId: user.id });
        if (!warningData) {
            warningData = new Warning({ userId: user.id, warnings: [] });
        }

        for (let i = 0; i < count; i++) {
            warningData.warnings.push({ reason });
        }
        await warningData.save();

        const embed = new EmbedBuilder()
            .setTitle('🚨 경고 추가')
            .setDescription(`**${user} 님에게 경고를 추가했습니다.**`)
            .addFields(
                { name: '⚖️ 관리자', value: `${interaction.user} (${interaction.user.id})`, inline: true },
                { name: '👤 대상', value: `${user} (${user.id})`, inline: true },
                { name: '📝 사유', value: `\`\`\`${reason}\`\`\`` },
                { name: '📌 추가된 경고 수', value: `${count}회`, inline: true },
                { name: '📊 총 경고 수', value: `${warningData.warnings.length}회`, inline: true }
            )
            .setColor(Colors.Red)
            .setThumbnail(user.displayAvatarURL());

        const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
        if (logChannel) logChannel.send({ embeds: [embed] });

        interaction.reply({ content: '✅ **경고 추가 완료!**', flags: MessageFlags.Ephemeral });
    },
};
