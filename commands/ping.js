// commands/ping.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    // Definizione dei dati del comando slash
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Risponde con la latenza del bot!'), // Descrizione del comando

    // Logica di esecuzione del comando
    async execute(interaction, ephemeralReply) {
        // Rispondi immediatamente per mostrare che il bot sta elaborando
        // Questo è utile per i comandi che potrebbero impiegare un attimo,
        // anche se /ping è solitamente molto veloce.
        await interaction.deferReply({ ephemeral: true }); // Risposta effimera, visibile solo all'utente

        // Calcola la latenza del roundtrip dell'API di Discord
        // interaction.createdTimestamp è il momento in cui l'interazione è stata creata
        // Date.now() è il momento attuale
        const latency = Date.now() - interaction.createdTimestamp;

        // Recupera la latenza del websocket del bot (latenza tra il bot e il gateway di Discord)
        const websocketPing = interaction.client.ws.ping;

        // Costruisci il messaggio di risposta
        const replyContent = `Pong! 🏓\nLatenza API: \`${latency}ms\`\nLatenza WebSocket: \`${websocketPing}ms\``;

        // Invia la risposta, modificando il messaggio di defer iniziale
        await interaction.editReply(ephemeralReply(replyContent));
    },
};