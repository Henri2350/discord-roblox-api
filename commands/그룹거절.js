const { SlashCommandBuilder } = require('discord.js');
const GroupRequest = require('../models/GroupRequest');
const { declineGroupRequest } = require('../utils/roblox');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('그룹거절')
        .setDescription('로블록스 그룹 요청을 거절합니다.')
        .addStringOption(option => 
            option.setName('유저명')
                .setDescription('가입을 거절할 로블록스 유저명')
                .setRequired(true)
        ),

    async execute(interaction) {
        const username = interaction.options.getString('유저명');
        const member = interaction.member;

        // ✅ 사용자가 adminRoleId 역할을 가지고 있는지 확인
        if (!member.roles.cache.has(config.adminRoleId)) {
            return interaction.reply({ content: '🚫 이 명령어를 사용할 권한이 없습니다.', ephemeral: true });
        }

        const request = await GroupRequest.findOne({ username, status: 'pending' });

        if (!request) {
            return interaction.reply({ content: `⚠️ '${username}'님의 그룹 요청을 찾을 수 없습니다.`, ephemeral: true });
        }

        const success = await declineGroupRequest(request.userId);
        if (success) {
            request.status = 'denied';
            await request.save();
            return interaction.reply(`🚫 **${username}**님의 그룹 요청이 거절되었습니다.`);
        } else {
            return interaction.reply({ content: `❌ 그룹 요청 거절에 실패했습니다.`, ephemeral: true });
        }
    }
};
