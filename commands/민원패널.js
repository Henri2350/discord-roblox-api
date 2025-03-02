const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('민원패널')
        .setDescription('민원 패널을 생성합니다.'),

    async execute(interaction) {
        const member = interaction.member;

        // ✅ 사용자가 adminRoleId 역할을 가지고 있는지 확인
        if (!member.roles.cache.has(config.adminRoleId)) {
            return interaction.reply({ content: '🚫 이 명령어를 사용할 권한이 없습니다.', ephemeral: true });
        }

        const embed = {
            title: '제주 민원 접수처 ✉️',
            description: '민원을 열기 전 <#1306899719766675456>을 먼저 확인 바랍니다.',
            color: 0x3498db
        };

        const row = {
            type: 1,
            components: [
                {
                    type: 3,
                    custom_id: 'ticket_create',
                    placeholder: '문의 유형을 선택하세요',
                    options: [
                        { label: '기타문의', value: '기타' },
                        { label: '사업 문의', value: '사업' },
                        { label: '집회 신청', value: '집회' },
                        { label: '후원 문의하기', value: '후원' },
                        { label: '복구 신청', value: '복구' },
                        { label: '신고하기 (인겜은 경찰 채널)', value: '신고' }
                    ]
                }
            ]
        };

        const channel = interaction.guild.channels.cache.get(config.ticketPanelChannelId);
        if (!channel) {
            return interaction.reply({ content: '🚫 패널 채널을 찾을 수 없습니다.', ephemeral: true });
        }

        await channel.send({ embeds: [embed], components: [row] });
        interaction.reply({ content: '✅ 민원 패널이 생성되었습니다!', ephemeral: true });
    }
};
