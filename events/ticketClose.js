const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Ticket = require('../models/Ticket');
const config = require('../config.js');
const { createTranscript } = require('discord-html-transcripts');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton() || !['save_close', 'no_save_close'].includes(interaction.customId)) return;

        if (interaction.customId === 'save_close') {
            await interaction.deferReply();

            try {
                const transcript = await createTranscript(interaction.channel, {
                    limit: -1,
                    returnBuffer: false,
                    fileName: `ticket-${interaction.channel.id}.html`
                });

                const logChannel = interaction.guild.channels.cache.get(config.ticketLogChannelId);
                if (logChannel) {
                    const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
                    if (!ticket) {
                        return interaction.editReply({ content: '⚠️ 티켓 정보를 찾을 수 없습니다.', ephemeral: true });
                    }

                    const user = await interaction.guild.members.fetch(ticket.userId);
                    const userAvatar = user.user.displayAvatarURL({ size: 64 });

                    const embed = new EmbedBuilder()
                        .setTitle(`📁 티켓 기록: ${interaction.channel.name}`)
                        .setDescription(`**채널 주인:** <@${user.id}>\n**채널 분류:** **${interaction.channel.name.split('-')[0]}**`)
                        .setThumbnail(userAvatar)
                        .setColor('Blue');

                    await logChannel.send({ embeds: [embed], files: [transcript] });
                }

                await interaction.editReply({ content: '✅ 티켓이 저장되었습니다. 3초 후 닫힙니다.' });
            } catch (error) {
                console.error('❌ 티켓 저장 중 오류 발생:', error);
                await interaction.editReply({ content: '⚠️ 티켓 저장 중 오류 발생.', ephemeral: true });
            }
        }

        if (interaction.customId === 'no_save_close') {
            await interaction.reply({ content: '🛑 티켓이 3초 후 닫힙니다.' });
        }

        setTimeout(() => interaction.channel.delete(), 3000);
    }
};
