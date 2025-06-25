// commands/delete.js
const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'delete',
        description: 'Cancella un numero di messaggi (solo moderatori)',
        default_member_permissions: PermissionsBitField.Flags.ManageMessages.toString(),
        dm_permission: false,
        options: [
            {
                name: 'count',
                description: 'Numero di messaggi da eliminare (max 100)',
                type: 4, // INTEGER
                required: true
            }
        ]
    },
    async execute(interaction, ephemeralReply) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply(ephemeralReply('🚫 Solo i moderatori possono usare questo comando.'));
        }

        const count = interaction.options.getInteger('count');
        if (count < 1 || count > 100) {
            return interaction.reply(ephemeralReply('❌ Puoi eliminare da 1 a 100 messaggi alla volta.'));
        }

        // Fetch messages + 1 per includere il comando delete stesso
        const messages = await interaction.channel.messages.fetch({ limit: count + 1 });
        const deletableMessages = messages.filter(msg => msg.deletable);

        if (deletableMessages.size === 0) {
            return interaction.reply(ephemeralReply('Non ci sono messaggi recenti eliminabili nella quantità specificata.'));
        }

        try {
            // Elimina i messaggi, escludendo il messaggio del comando se non è necessario eliminarlo
            // Se vuoi eliminare anche il comando, usa deletableMessages
            // Se vuoi solo i messaggi precedenti, filtra messages e poi .delete() il comando.
            await interaction.channel.bulkDelete(deletableMessages, true);
            // Il messaggio di risposta è effimero per non essere eliminato
            await interaction.reply(ephemeralReply(`✅ Eliminati ${deletableMessages.size - 1} messaggi.`)); // -1 perché il comando stesso potrebbe essere stato incluso

        } catch (error) {
            console.error('Errore nell\'eliminazione dei messaggi:', error);
            await interaction.reply(ephemeralReply('❌ Errore durante l\'eliminazione dei messaggi. Assicurati che il bot abbia i permessi necessari e che i messaggi non siano troppo vecchi (Discord non permette di eliminare messaggi più vecchi di 14 giorni in bulk).'));
        }
    }
};