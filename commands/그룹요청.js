const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GroupRequest = require('../models/GroupRequest');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('그룹요청')
        .setDescription('로블록스 계정 등록 요청을 보냅니다.')
        .addStringOption(option => 
            option.setName('유저명')
                .setDescription('로블록스 유저명을 입력하세요.')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('유저id')
                .setDescription('로블록스 유저 ID를 입력하세요.')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages), // ✅ 모든 유저가 사용 가능하도록 설정

    async execute(interaction) {
        const username = interaction.options.getString('유저명');
        const userId = interaction.options.getString('유저id');
        const discordId = interaction.user.id;

        // 이미 존재하는 요청이 있는지 확인
        const existingRequest = await GroupRequest.findOne({ userId, status: 'pending' });
        if (existingRequest) {
            return interaction.reply({ content: `⚠️ 이미 등록 요청이 접수되었습니다.`, ephemeral: true });
        }

        // 새로운 요청 저장
        const request = new GroupRequest({ username, userId, discordId, status: 'pending' });
        await request.save();

        return interaction.reply(`✅ **${username}**님의 등록 요청이 접수되었습니다!`);
    }
};