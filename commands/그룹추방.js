const { SlashCommandBuilder } = require('discord.js');
const noblox = require('noblox.js');
const config = require('../config.js');

async function loginToRoblox() {
    try {
        await noblox.setCookie(config.ROBLOX_COOKIE);
        console.log('✅ 로블록스 로그인 성공!');
    } catch (error) {
        console.error('❌ 로블록스 로그인 실패:', error);
    }
}

// ✅ 유저 그룹 요청 승인 (함수 변경됨)
async function acceptGroupRequest(userId) {
    try {
        await noblox.handleJoinRequest(config.ROBLOX_GROUP_ID, userId, true); // ✅ 변경된 함수
        return true;
    } catch (error) {
        console.error('❌ 그룹 요청 승인 실패:', error);
        return false;
    }
}

// ✅ 유저 그룹 요청 거절
async function declineGroupRequest(userId) {
    try {
        await noblox.handleJoinRequest(config.ROBLOX_GROUP_ID, userId, false); // ✅ 변경된 함수
        return true;
    } catch (error) {
        console.error('❌ 그룹 요청 거절 실패:', error);
        return false;
    }
}

// ✅ 유저 그룹 추방
async function kickGroupMember(userId) {
    try {
        await noblox.exile(config.ROBLOX_GROUP_ID, userId);
        return true;
    } catch (error) {
        console.error('❌ 그룹 추방 실패:', error);
        return false;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('그룹추방')
        .setDescription('로블록스 그룹에서 유저를 추방합니다.')
        .addStringOption(option => 
            option.setName('유저명')
                .setDescription('추방할 로블록스 유저 이름')
                .setRequired(true)),

    async execute(interaction) {
        const username = interaction.options.getString('유저명');

        if (!username) {
            return interaction.reply({ content: '유저 이름을 입력해 주세요.', ephemeral: true });
        }

        try {
            // 유저 이름을 유저 ID로 변환
            const userId = await noblox.getIdFromUsername(username);
            if (!userId) {
                return interaction.reply({ content: '유효하지 않은 유저 이름입니다.', ephemeral: true });
            }

            const result = await kickGroupMember(userId);
            if (result) {
                return interaction.reply({ content: `${username} 유저가 그룹에서 추방되었습니다.` });
            } else {
                return interaction.reply({ content: '유저 그룹 추방에 실패했습니다.', ephemeral: true });
            }
        } catch (error) {
            console.error('❌ 그룹 추방 실패:', error);
            return interaction.reply({ content: '유효하지 않은 유저 이름입니다.', ephemeral: true });
        }
    }
};