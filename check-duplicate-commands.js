const fs = require('fs');
const path = require('path');

// 명령어 불러오기
const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

const commandNames = {};

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data) {
        const commandName = command.data.name;
        if (commandNames[commandName]) {
            commandNames[commandName].push(file);
        } else {
            commandNames[commandName] = [file];
        }
    } else {
        console.error(`❌ ${file} 파일에서 data 속성을 찾을 수 없습니다.`);
    }
}

// 중복된 명령어 이름 출력
for (const [name, files] of Object.entries(commandNames)) {
    if (files.length > 1) {
        console.log(`❌ 중복된 명령어 이름: ${name}`);
        console.log(`   파일 목록: ${files.join(', ')}`);
    }
}