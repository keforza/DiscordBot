// utils/replyHandler.js

/**
 * Crea un oggetto di risposta effimera per Discord.
 * Un messaggio effimero è visibile solo all'utente che ha invocato il comando.
 * @param {string|import('discord.js').EmbedBuilder} contentOrEmbed - Il contenuto del messaggio (stringa) o un EmbedBuilder.
 * @returns {object} Un oggetto con le proprietà `content` o `embeds` e `flags` per una risposta effimera.
 */
function ephemeralReply(contentOrEmbed) {
    // Il flag 1 << 6 corrisponde a MessageFlags.Ephemeral
    return typeof contentOrEmbed === 'string'
        ? { content: contentOrEmbed, flags: 1 << 6 }
        : { embeds: [contentOrEmbed], flags: 1 << 6 };
}

module.exports = {
    ephemeralReply
};