const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with the bot\'s general latency!'),

    async execute(interaction, ephemeralReply) {
        await interaction.deferReply({ ephemeral: true });

        // Calculate the roundtrip latency (from command sent to bot processing)
        const generalLatency = Date.now() - interaction.createdTimestamp;

        const replyContent = `Pong! 🏓\n Latency: \`${generalLatency}ms\``;

        await interaction.editReply(ephemeralReply(replyContent));
    },
};