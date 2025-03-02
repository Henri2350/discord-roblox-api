const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');
const Player = require('../models/Player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('차량명의이전')
        .setDescription('다른 유저에게 차량을 이전합니다.')
        .addStringOption(option => 
            option.setName('소유자')
                .setDescription('차량 소유자 로블록스 닉네임')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('수신자')
                .setDescription('차량 이전받을 유저 로블록스 닉네임')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('차량')
                .setDescription('이전할 차량')
                .setRequired(true)),

    async execute(interaction) {
        const ownerName = interaction.options.getString('소유자');
        const receiverName = interaction.options.getString('수신자');
        const vehicleName = interaction.options.getString('차량');

        const owner = await Player.findOne({ username: ownerName });
        const receiver = await Player.findOne({ username: receiverName });

        if (!owner || !receiver) {
            return interaction.reply({ content: '소유자 또는 수신자의 로블록스 닉네임을 찾을 수 없습니다.', ephemeral: true });
        }

        const vehicleIndex = owner.vehicles.indexOf(vehicleName);
        if (vehicleIndex === -1) {
            return interaction.reply({ content: '소유자의 차량 목록에 해당 차량이 없습니다.', ephemeral: true });
        }

        owner.vehicles.splice(vehicleIndex, 1);
        receiver.vehicles.push(vehicleName);

        owner.balance -= 1000000; // 명의 이전 비용 차감

        await owner.save();
        await receiver.save();

        return interaction.reply({ content: `${vehicleName} 차량을 ${receiverName}님에게 이전했습니다. 명의 이전 비용 100만원이 차감되었습니다.` });
    }
};