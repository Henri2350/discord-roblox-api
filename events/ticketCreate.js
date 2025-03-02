const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType, PermissionsBitField, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Ticket = require('../models/Ticket');
const config = require('../config.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // 🟢 셀렉트 메뉴 선택 시 모달 띄우기
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_create') {
            const type = interaction.values[0];

            if (!config.ticketQuestions[type]) {
                return interaction.reply({ content: `⚠️ '${type}' 문의 유형이 설정되지 않았습니다.`, ephemeral: true });
            }

            const modal = new ModalBuilder()
                .setCustomId(`ticket_modal_${type}`)
                .setTitle(`${type} 문의`);

            config.ticketQuestions[type].forEach(question => {
                modal.addComponents(new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(question.id)
                        .setLabel(question.label)
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                ));
            });

            await interaction.showModal(modal);
        }

        // 🟢 모달 응답 제출 후 티켓 생성
        if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_modal_')) {
            const type = interaction.customId.replace('ticket_modal_', '');

            if (!config.ticketQuestions[type]) {
                return interaction.reply({ content: `⚠️ '${type}' 문의 유형이 설정되지 않았습니다.`, ephemeral: true });
            }

            const responses = config.ticketQuestions[type].map(q => {
                const value = interaction.fields.getTextInputValue(q.id) || "응답 없음";
                return { name: `\`\`\`${q.label}\`\`\``, value: `\`\`\`${value}\`\`\`` };
            });

            const ticketNumber = (await Ticket.countDocuments()) + 1;
            const channelName = `${type}-${ticketNumber.toString().padStart(4, '0')}`;
            const roleMention = `<@&${config.ticketRoles[type]}>`;
            const userMention = `<@${interaction.user.id}>`;

            const category = interaction.guild.channels.cache.get(config.ticketCategoryId);
            const ticketChannel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    { id: interaction.guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                    { id: config.adminRoleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                ]
            });

            const embed = new EmbedBuilder()
                .setTitle(`📩 ${type} 문의가 열렸습니다`)
                .setDescription(`문의하신 내용에 대한 답변을 기다려 주세요.`)
                .addFields([{ name: "문의자", value: userMention }, ...responses]) // ✅ 문의자 맨션에서 ```글``` 제거
                .setColor('Blue');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`assign_staff_${ticketChannel.id}`)
                    .setLabel('담당자 배정')
                    .setStyle(ButtonStyle.Primary)
            );

            await ticketChannel.send({ content: `${roleMention}`, embeds: [embed], components: [row] });

            const ticket = new Ticket({
                userId: interaction.user.id,
                type,
                channelId: ticketChannel.id,
                responses: responses.map(r => ({ question: r.name, answer: r.value })),
                assignedStaff: null,
                createdAt: new Date()
            });
            await ticket.save();

            await interaction.reply({ content: `✅ 티켓이 생성되었습니다: ${ticketChannel}`, ephemeral: true });
        }

        // 🟢 담당자 배정 버튼 클릭 처리
        if (interaction.isButton() && interaction.customId.startsWith('assign_staff_')) {
            const channelId = interaction.customId.replace('assign_staff_', '');
            const ticket = await Ticket.findOne({ channelId });

            if (!ticket) {
                return interaction.reply({ content: '⚠️ 티켓 정보를 찾을 수 없습니다.', ephemeral: true });
            }

            // 🔹 이미 담당자가 배정되었는지 확인
            if (ticket.assignedStaff) {
                return interaction.reply({ content: `⚠️ 이미 <@${ticket.assignedStaff}>님이 담당자로 배정되었습니다.`, ephemeral: true });
            }

            // 🔹 담당자 배정 및 MongoDB 업데이트
            ticket.assignedStaff = interaction.user.id;
            await ticket.save();

            // 🔹 기존 메시지 업데이트 (버튼 비활성화)
            const ticketChannel = interaction.guild.channels.cache.get(channelId);
            if (!ticketChannel) {
                return interaction.reply({ content: '⚠️ 티켓 채널을 찾을 수 없습니다.', ephemeral: true });
            }

            const messages = await ticketChannel.messages.fetch({ limit: 10 });
            const ticketMessage = messages.find(msg => msg.components.length > 0);

            if (ticketMessage) {
                const updatedEmbed = EmbedBuilder.from(ticketMessage.embeds[0])
                    .setFooter({ text: `담당자: ${interaction.user.tag}` });

                const updatedRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`assign_staff_${channelId}`)
                        .setLabel('담당자 배정 완료')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                );

                await ticketMessage.edit({ embeds: [updatedEmbed], components: [updatedRow] });
            }

            // 🔹 담당자 배정 완료 메시지를 해당 채널에 보내기 (모든 사람이 볼 수 있도록)
            await ticketChannel.send(`📌 **담당자로 ${interaction.user}님이 배정되었습니다!**`);

            await interaction.reply({ content: `📌 담당자로 배정되었습니다! ${interaction.user}`, ephemeral: true });
        }
    }
};
