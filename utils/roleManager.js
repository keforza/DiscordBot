// utils/roleManager.js
const { PermissionsBitField } = require('discord.js');

/**
 * Assicura l'esistenza di un ruolo 'Muted' e configura i permessi per esso.
 * @param {import('discord.js').Guild} guild - L'oggetto Guild.
 * @returns {Promise<import('discord.js').Role|null>} Il ruolo 'Muted' o null in caso di errore.
 */
async function ensureMuteRole(guild) {
    let muteRole = guild.roles.cache.find(r => r.name === 'Muted');
    if (!muteRole) {
        try {
            muteRole = await guild.roles.create({
                name: 'Muted',
                color: '#555555',
                permissions: []
            });
            // Sovrascrivi i permessi per ogni canale
            for (const [, channel] of guild.channels.cache) {
                // Aggiungi questo controllo per evitare l'errore!
                if (channel.manageable) { 
                    await channel.permissionOverwrites.edit(muteRole, {
                        SendMessages: false,
                        AddReactions: false,
                        Speak: false,
                        Connect: false,
                        UseApplicationCommands: false
                    });
                }
            }
        } catch (error) {
            console.error('Errore creando ruolo Muted:', error);
            return null;
        }
    }
    return muteRole;
}

module.exports = {
    ensureMuteRole
};