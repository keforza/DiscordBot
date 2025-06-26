// utils/replyHandler.js
const { MessageFlags } = require('discord.js'); // <--- AGGIUNGI QUESTA RIGA

/**
 * Crea un oggetto di risposta effimera per Discord.
 * Un messaggio effimero è visibile solo all'utente che ha invocato il comando.
 * @param {string|import('discord.js').EmbedBuilder} contentOrEmbed - Il contenuto del messaggio (stringa) o un EmbedBuilder.
 * @returns {object} Un oggetto con le proprietà `content` o `embeds` e `flags` per una risposta effimera.
 */
function ephemeralReply(contentOrEmbed) {
    // Utilizziamo la costante MessageFlags.Ephemeral per chiarezza
    return typeof contentOrEmbed === 'string'
        ? { content: contentOrEmbed, flags: MessageFlags.Ephemeral }
        : { embeds: [contentOrEmbed], flags: MessageFlags.Ephemeral };
}

module.exports = {
    ephemeralReply
};