const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/roblox', { useNewUrlParser: true, useUnifiedTopology: true });

const playerSchema = new mongoose.Schema({
    username: String,
    balance: Number,
    vehicles: [String]
});

const Player = mongoose.model('Player', playerSchema);

app.post('/updatePlayer', async (req, res) => {
    const { username, balance, vehicles } = req.body;

    let player = await Player.findOne({ username });
    if (!player) {
        player = new Player({ username, balance, vehicles });
    } else {
        player.balance = balance;
        player.vehicles = vehicles;
    }

    await player.save();
    res.send('Player data updated');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});