const { SlashCommandBuilder, MessageFlags } = require('discord.js'); // <-- AGGIUNGI MessageFlags qui!

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with the bot\'s general latency!'),

    async execute(interaction, ephemeralReply) {
        // MODIFICATO QUI: Sostituito 'ephemeral: true' con 'flags: MessageFlags.Ephemeral'
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        // Calcola la latenza di andata e ritorno (dal comando inviato all'elaborazione del bot)
        const generalLatency = Date.now() - interaction.createdTimestamp;

        const replyContent = `Pong! 🏓\n Latency: \`${generalLatency}ms\``;

        // Questo riga dipende da come è definita la tua funzione `ephemeralReply`
        // Se `ephemeralReply` restituisce già un oggetto con `flags: MessageFlags.Ephemeral`, va bene.
        // Altrimenti, potrebbe essere necessario modificarla (vedi nota sotto).
        await interaction.editReply(ephemeralReply(replyContent));
    },
};