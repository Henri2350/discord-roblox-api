require('dotenv').config(); // 이거 먼저 있어야 함!
const fs = require('fs');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { DISCORD_TOKEN, mongoURI, API_PORT } = require('./config');
const RobloxUser = require('./models/RobloxUser');
const { loginToRoblox } = require('./utils/roblox'); // 중복 제거된 로블록스 로그인

// 디스코드 봇 클라이언트 설정
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
    // ✅ 유효한 명령어인지 확인
    if (command && command.data && command.data.name) {
        client.commands.set(command.data.name, command);
    } else {
        console.warn(`⚠️ ${file} 파일에 유효한 command.data.name이 없습니다. 건너뜁니다.`);
    }
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

client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} 봇이 온라인입니다!`);
    await loginToRoblox();
});

// ✅ MongoDB 연결
mongoose.connect(mongoURI)
    .then(() => console.log('✅ MongoDB 연결 성공!'))
    .catch(err => console.error('❌ MongoDB 연결 실패:', err));

// ✅ API 서버 시작
const app = express();
app.use(express.json());

// API - 잔액 지급
app.post('/give-money', async (req, res) => {
    const { username, amount } = req.body;
    const user = await RobloxUser.findOne({ robloxUsername: username });
    if (!user) return res.status(404).send('유저 없음');

    user.balance += amount;
    await user.save();
    res.send('성공');
});

// API - 잔액 조회
app.get('/get-balance/:username', async (req, res) => {
    const user = await RobloxUser.findOne({ robloxUsername: req.params.username });
    if (!user) return res.status(404).send('유저 없음');

    res.json({ balance: user.balance });
});

app.listen(API_PORT, () => {
    console.log(`🌐 API 서버 실행 중: http://localhost:${API_PORT}`);
});

// ✅ 봇 로그인
client.login(DISCORD_TOKEN);
