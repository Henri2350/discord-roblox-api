const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GroupRequest = require('../models/GroupRequest');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('기존유저등록')
        .setDescription('기존 유저 데이터를 MongoDB에 저장합니다.')
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
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages), // 특정 역할을 가진 유저가 사용 가능

    async execute(interaction) {
        const username = interaction.options.getString('유저명');
        const userId = interaction.options.getString('유저id');
        const discordId = interaction.user.id;
        const member = interaction.member;

        // 특정 역할을 가진 유저만 사용 가능
        if (!member.roles.cache.has(config.allowedRoleId)) {
            return interaction.reply({ content: '🚫 이 명령어를 사용할 권한이 없습니다.', ephemeral: true });
        }

        // 이미 존재하는 요청이 있는지 확인
        const existingRequest = await GroupRequest.findOne({ userId });
        if (existingRequest) {
            return interaction.reply({ content: `⚠️ 이미 등록된 유저입니다.`, ephemeral: true });
        }

        // 새로운 요청 저장
        const request = new GroupRequest({ username, userId, discordId, status: 'accepted' });
        await request.save();

        return interaction.reply(`✅ **${username}**님의 정보가 저장되었습니다!`);
    }
};