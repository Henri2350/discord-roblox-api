const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, InteractionResponseType } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const {
    getGameConfiguration,
    saveGameConfiguration
} = require('../roblox');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('서버공개')
        .setDescription('Roblox 게임의 공개 여부를 설정합니다.')
        .addBooleanOption(option =>
            option.setName('공개여부')
                .setDescription('게임을 공개할지 비공개로 설정할지 선택합니다.')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ flags: 1 }); // ephemeral 대체

        const isPublic = interaction.options.getBoolean('공개여부');
        const universeId = process.env.UNIVERSE_ID;

        try {
            const currentSettings = await getGameConfiguration();

            const updatedSettings = {
                ...currentSettings,
                isPublic: isPublic,
                isForSale: isPublic,
                privateServerPrice: 0,
                allowPrivateServers: true
            };

            const result = await saveGameConfiguration(updatedSettings);

            if (result.success) {
                const embed = new EmbedBuilder()
                    .setTitle('✅ 게임 공개 설정 성공')
                    .setDescription(`게임이 성공적으로 **${isPublic ? '공개' : '비공개'}**로 설정되었습니다.`)
                    .setColor('Green')
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                    .setTitle('❌ 설정 실패')
                    .setDescription('Roblox에서 설정을 저장하는 데 실패했습니다.')
                    .addFields(
                        { name: '오류', value: result.error }
                    )
                    .setColor('Red')
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }
        } catch (err) {
            console.error('서버공개 명령어 오류:', err);
            const embed = new EmbedBuilder()
                .setTitle('⚠️ 예외 발생')
                .setDescription('명령어 실행 중 예외가 발생했습니다.')
                .addFields({ name: '오류 메시지', value: err.message })
                .setColor('Red')
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });
        }
    }
};
