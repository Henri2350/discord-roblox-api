require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// 환경 변수에서 가져오기
const { CLIENT_ID, GUILD_ID, DISCORD_TOKEN } = process.env;

// 명령어 불러오기
const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data) {
        commands.push(command.data.toJSON());
    } else {
        console.error(`❌ ${file} 파일에서 data 속성을 찾을 수 없습니다.`);
    }
}

// 디스코드 API에 명령어 등록
const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
    try {
        console.log('📝 디스코드 명령어 갱신 중...');

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );

        console.log('✅ 슬래시 명령어가 성공적으로 갱신되었습니다!');
    } catch (error) {
        console.error('❌ 명령어 갱신 중 오류 발생:', error);
    }
})();