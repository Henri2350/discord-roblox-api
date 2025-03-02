const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('송금')
        .setDescription('다른 유저에게 돈을 송금합니다.')
        .addStringOption(option => 
            option.setName('송금자')
                .setDescription('송금자 로블록스 닉네임')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('수신자')
                .setDescription('송금 받을 유저 로블록스 닉네임')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('금액')
                .setDescription('송금할 금액')
                .setRequired(true)),

    async execute(interaction) {
        // 명령어 실행 로직
    }
};