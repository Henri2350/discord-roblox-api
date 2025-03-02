const { SlashCommandBuilder, EmbedBuilder, Colors, MessageFlags } = require('discord.js');
const config = require('../config.js'); // ✅ config.js 불러오기 추가

module.exports = {
    data: new SlashCommandBuilder()
        .setName('추방')
        .setDescription('사용자를 서버에서 추방합니다.')
        .addUserOption(option => 
            option.setName('유저')
                .setDescription('추방할 유저')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('사유')
                .setDescription('추방 사유')
                .setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(config.adminRoleId)) {
            return interaction.reply({ content: '🚫 **권한이 없습니다.**', flags: MessageFlags.Ephemeral });
        }

        const user = interaction.options.getUser('유저');
        const reason = interaction.options.getString('사유');

        try {
            const member = await interaction.guild.members.fetch(user.id);
            if (!member) {
                return interaction.reply({ content: '⚠️ **해당 사용자를 찾을 수 없습니다.**', flags: MessageFlags.Ephemeral });
            }

            await member.kick(reason);

            const embed = new EmbedBuilder()
                .setTitle('🚪 사용자 추방')
                .setDescription(`**${user} 님이 서버에서 추방되었습니다.**`)
                .addFields(
                    { name: '⚖️ 관리자', value: `${interaction.user} (${interaction.user.id})`, inline: true },
                    { name: '🚷 추방된 사용자', value: `${user} (${user.id})`, inline: true },
                    { name: '📝 사유', value: `\`\`\`${reason}\`\`\`` }
                )
                .setColor(Colors.DarkOrange)
                .setThumbnail(user.displayAvatarURL());

            const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
            if (logChannel) logChannel.send({ embeds: [embed] });

            interaction.reply({ content: `✅ **${user} 님을 추방했습니다.**`, flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: '⚠️ **추방 처리 중 오류가 발생했습니다.**', flags: MessageFlags.Ephemeral });
        }
    },
};
