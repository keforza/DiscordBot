const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with the bot\'s general latency!'),

    async execute(interaction) {
        // Differisce la risposta come effimera (visibile solo a chi ha usato il comando)
        // Usa 'ephemeral: true' secondo la sintassi raccomandata da Discord.js v14+
        await interaction.deferReply({ ephemeral: true });

        // Calcola la latenza di andata e ritorno (dal comando inviato all'elaborazione del bot)
        const generalLatency = Date.now() - interaction.createdTimestamp;

        // Calcola la latenza dell'API di Discord (ping del websocket del bot)
        const apiLatency = interaction.client.ws.ping;

        const embed = new EmbedBuilder()
            .setColor('#7289DA') // Colore di Discord
            .setTitle('🏓 Pong!') // Titolo dell'embed con emoji
            .addFields(
                { name: '🤖 Bot Latency', value: `${generalLatency}ms`, inline: true }, // Latenza del bot
                { name: '🌐 API Latency', value: `${apiLatency}ms`, inline: true } // Latenza API Discord
            );

        // Modifica la risposta deferita con l'embed creato
        await interaction.editReply({ embeds: [embed] });
    },
};