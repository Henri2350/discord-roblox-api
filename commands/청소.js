const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.js'); // config.js 파일 불러오기

module.exports = {
    data: new SlashCommandBuilder()
        .setName('청소')
        .setDescription('지정된 개수의 메시지를 삭제할 수 있어요')
        .addIntegerOption(option => 
            option.setName('갯수')
                .setDescription('삭제할 메시지의 개수')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)), // 삭제할 최대 개수 설정

    async execute(interaction) {
        // 특정 역할 확인
        if (!interaction.member.roles.cache.has(config.adminRoleId)) {
            const embed = new EmbedBuilder()
                .setTitle('어라.. 오류가 발생했어요')
                .setDescription('해당 명령어를 사용할 권한이 없는 것 같아요.')
                .setColor('#FF8F00')

            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // 사용자가 입력한 삭제할 메시지 개수 가져오기
        const count = interaction.options.getInteger('갯수');

        // 메시지를 삭제하는 작업
        try {
            await interaction.channel.bulkDelete(count, true); // true는 오래된 메시지를 제외하고 삭제
            
            const successEmbed = new EmbedBuilder()
            .setTitle('✅메시지 삭제 완료!')
            .setDescription(`🗑️${count}개의 메시지를 성공적으로 삭제했어요.`)
            .setColor('#0066FF');        
            
            await interaction.reply({ embeds: [successEmbed], ephemeral: true });
        } catch (error) {
            console.error('⚠️ 메시지 삭제 중 오류 발생:', error);
            const errorEmbed = new EmbedBuilder()
                .setTitle('어라.. 오류가 발생했어요')
                .setDescription('메시지를 삭제하는 동안 오류가 발생한 것 같아요.')
                .setColor('#FF8F00')
            
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};