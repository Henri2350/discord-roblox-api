const { SlashCommandBuilder, EmbedBuilder, Colors, MessageFlags } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('차단해제')
        .setDescription('사용자의 서버 차단을 해제합니다.')
        .addUserOption(option => 
            option.setName('유저')
                .setDescription('차단을 해제할 유저')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('사유')
                .setDescription('차단 해제 사유')
                .setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(config.adminRoleId)) {
            return interaction.reply({ content: '🚫 **권한이 없습니다.**', flags: MessageFlags.Ephemeral });
        }

        const user = interaction.options.getUser('유저');
        const reason = interaction.options.getString('사유');

        try {
            const bans = await interaction.guild.bans.fetch();
            if (!bans.has(user.id)) {
                return interaction.reply({ content: '⚠️ **해당 사용자는 차단되어 있지 않습니다.**', flags: MessageFlags.Ephemeral });
            }

            await interaction.guild.members.unban(user.id, reason);

            const embed = new EmbedBuilder()
                .setTitle('🔓 사용자 차단 해제')
                .setDescription(`**${user} 님의 차단이 해제되었습니다.**`)
                .addFields(
                    { name: '⚖️ 관리자', value: `${interaction.user} (${interaction.user.id})`, inline: true },
                    { name: '🚷 차단 해제된 사용자', value: `${user} (${user.id})`, inline: true },
                    { name: '📝 사유', value: `\`\`\`${reason}\`\`\`` }
                )
                .setColor(Colors.Green)
                .setThumbnail(user.displayAvatarURL());

            const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
            if (logChannel) logChannel.send({ embeds: [embed] });

            interaction.reply({ content: `✅ **${user} 님의 차단을 해제했습니다.**`, flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: '⚠️ **차단 해제 처리 중 오류가 발생했습니다.**', flags: MessageFlags.Ephemeral });
        }
    },
};
