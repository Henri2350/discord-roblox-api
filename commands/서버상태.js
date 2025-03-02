const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.js');

const errorembed = new EmbedBuilder()
    .setTitle("검빡헙서 마씨!")
    .setDescription("감빡헙서 마씨!는 제주 사투리로 만지지 마를 조금 더 강하게 말한거야")
    .setColor("#F30000");

const replyembed = new EmbedBuilder()
    .setTitle("서버 상태를 변경했습니다.")
    .setDescription("서버 상태를 성공적으로 변경했습니다.")
    .setColor("#F30000");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('서버')
        .setDescription('서버 상태 공지를 전송합니다.')
        .addStringOption(option =>
            option.setName('상태')
                .setDescription('서버 상태를 선택하세요.')
                .setRequired(true)
                .addChoices(
                    { name: '서버열기', value: 'open' },
                    { name: '우선입장', value: 'starting' },
                    { name: '서버닫기', value: 'off' }
                )
        ),
    
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(config.adminRoleId)) {
            return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }

        const opench = interaction.client.channels.cache.get("870258062638866442"); // 서버오픈
        const logch = interaction.client.channels.cache.get("1196762213579505774"); // 우선입장
        const status = interaction.options.getString('상태');

        // 임베드 공통 설정
        const thumbnailUrl = 'https://cdn.discordapp.com/attachments/1150391753283739720/1212107687496650792/2.gif';
        const siteUrl = 'https://www.roblox.com/ko/games/11421337992/Jeju-New-Yeondong#!/game-instances';

        let embed, components = [];

        if (status === 'open') {
            const text = "<@&870146045571657799>"
            embed = new EmbedBuilder()
                .setTitle('서버 온라인 / SERVER ONLINE')
                .setDescription('입장 전 <#960211260488708198> 확인 후 준수해 주시길 바랍니다.')
                .setThumbnail(thumbnailUrl)
                .setFooter({ text: '아래 버튼을 클릭하면 사이트로 이동합니다.' })
                .setColor('Green')
                .setTimestamp();

            // 버튼 추가
            components.push(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('게임 접속')
                        .setURL(siteUrl)
                        .setStyle(ButtonStyle.Link)
                )
            );

            opench.send(text)
            opench.send({ embeds: [embed], components });
        }
        if (status === 'starting') {
            const text = "<@&870146045571657799>"
            embed = new EmbedBuilder()
                .setTitle('서버 온라인 / SERVER ONLINE')
                .setDescription('오픈 30분 전, 미리 접속 가능합니다.')
                .setThumbnail(thumbnailUrl)
                .setFooter({ text: '아래 버튼을 클릭하면 사이트로 이동합니다.' })
                .setColor('Blue')
                .setTimestamp();

            // 버튼 추가
            components.push(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('게임 접속')
                        .setURL(siteUrl)
                        .setStyle(ButtonStyle.Link)
                )
            );
            
            logch.send(text)
            logch.send({ embeds: [embed], components });
        }
        if (status === 'off') {
            embed = new EmbedBuilder()
                .setTitle('서버 오프라인 / SERVER OFFLINE')
                .setDescription('서버가 오프라인 상태로 전환되었습니다. 제주를 즐기기 위해 <#960211260488708198> 채널을 확인해 주세요.')
                .setThumbnail(thumbnailUrl)
                .setColor('Red')
                .setTimestamp();

            opench.send({ embeds: [embed] }); // 오프라인 공지는 버튼 없음
        }

        interaction.reply({ embeds: [replyembed], ephemeral: true });
    }
};