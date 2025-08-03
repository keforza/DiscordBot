const { SlashCommandBuilder, EmbedBuilder } = require('discord.js'); // Rimuovi MessageFlags, non più necessario per ephemeral

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Risponde con la latenza generale del bot!'), // Descrizione in italiano per coerenza

    async execute(interaction) {
        // Differisce la risposta come effimera (visibile solo a chi ha usato il comando)
        // La sintassi corretta per rendere la risposta effimera è 'ephemeral: true'
        await interaction.deferReply({ ephemeral: true });

        // Calcola la latenza di andata e ritorno (dal comando inviato all'elaborazione del bot)
        const generalLatency = Date.now() - interaction.createdTimestamp;

        // Calcola la latenza dell'API di Discord (ping del websocket del bot)
        const apiLatency = interaction.client.ws.ping;

        const embed = new EmbedBuilder()
            .setColor('#7289DA') // Colore di Discord
            .setTitle('🏓 Pong!') // Titolo dell'embed con emoji
            .addFields(
                { name: '🤖 Latenza Bot', value: `${generalLatency}ms`, inline: true }, // Latenza del bot
                { name: '🌐 Latenza API', value: `${apiLatency}ms`, inline: true } // Latenza API Discord
            );

        // Modifica la risposta deferita con l'embed creato
        await interaction.editReply({ embeds: [embed] });
    },
};