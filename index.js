const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const express = require('express');
require('dotenv').config();
const axios = require('axios');

// 환경 변수에서 가져오기
const { DISCORD_TOKEN, MONGO_URI } = process.env;

// Express 앱 설정
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// 루트 경로 핸들러 추가
app.get('/', (req, res) => {
    res.send('Hello, world! Jeju Bot is running.');
});

// 로블록스 엔드포인트 설정
app.post('/roblox-endpoint', (req, res) => {
    const { username, amount, action } = req.body;

    // 로블록스 게임 서버로 HTTP 요청 보내기
    // 이 부분은 로블록스 게임 내에서 처리할 수 있도록 설정해야 합니다.
    // 예를 들어, 로블록스 게임 서버에서 HTTP 요청을 받아서 처리하는 스크립트를 작성합니다.

    console.log(`Received request: ${action} ${amount} for ${username}`);

    // 요청 처리 결과를 반환합니다.
    res.json({ success: true, message: 'Operation successful' });
});

// Express 서버 시작
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// 봇 클라이언트 설정
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

// 명령어 등록
client.commands = new Collection();
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// 이벤트 핸들러 등록
const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

const { loginToRoblox } = require('./utils/roblox');

client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} 봇이 온라인입니다!`);
    await loginToRoblox(); // 🔹 로블록스 로그인 실행
});

// ✅ MongoDB 연결 (경고 해결)
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB 연결 성공!'))
    .catch(err => console.error('❌ MongoDB 연결 실패:', err));

// 봇 로그인
client.login(DISCORD_TOKEN);