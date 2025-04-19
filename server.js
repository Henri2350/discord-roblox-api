const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const RobloxUser = require('./models/RobloxUser');

dotenv.config();
const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('✅ MongoDB 연결 완료');
}).catch(err => console.error('❌ MongoDB 연결 실패:', err));

// 화폐 지급
app.post('/give-money', async (req, res) => {
  const { username, amount } = req.body;
  const user = await RobloxUser.findOne({ robloxUsername: username });

  if (!user) {
    return res.status(404).send('유저 없음');
  }

  user.balance += amount;
  await user.save();
  res.send('성공');
});

// 로블록스 → 잔액 가져오기
app.get('/get-balance/:username', async (req, res) => {
  const user = await RobloxUser.findOne({ robloxUsername: req.params.username });
  if (!user) return res.status(404).send('유저 없음');
  res.json({ balance: user.balance });
});

app.listen(process.env.API_PORT, () => {
  console.log(`🚀 API 서버 실행 중 (포트 ${process.env.API_PORT})`);
});
