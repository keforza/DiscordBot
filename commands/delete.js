const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'delete',
        description: 'Deletes a number of messages (moderators only)',
        default_member_permissions: PermissionsBitField.Flags.ManageMessages.toString(),
        dm_permission: false,
        options: [
            {
                name: 'count',
                description: 'Number of messages to delete (max 100)',
                type: 4, // INTEGER
                required: true
            }
        ]
    },
    // Rimuoviamo 'ephemeralReply' come parametro, lo gestiremo direttamente
    async execute(interaction) {
        // Defer della risposta all'inizio, dato che l'operazione di fetch e bulkDelete può richiedere tempo
        // Rendi la risposta iniziale effimera
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            // Usa editReply dopo il defer
            return await interaction.editReply({
                content: '🚫 Only moderators can use this command.',
                ephemeral: true
            });
        }

        const count = interaction.options.getInteger('count');
        if (count < 1 || count > 100) {
            // Usa editReply dopo il defer
            return await interaction.editReply({
                content: '❌ You can delete between 1 and 100 messages at a time.',
                ephemeral: true
            });
        }

        // Fetchiamo i messaggi (+1 per includere il messaggio del comando stesso se necessario)
        // Non è necessario fare +1 se l'intento è solo cancellare i messaggi precedenti al comando
        // Se vuoi cancellare anche il messaggio del comando, allora fetch(limit: count + 1) e deletableMessages.size - 1 è corretto nel reply
        const messages = await interaction.channel.messages.fetch({ limit: count }); // Limit to 'count' messages
        const deletableMessages = messages.filter(msg => !msg.pinned && msg.deletable); // Filtra anche i messaggi pinnati che non si possono cancellare

        if (deletableMessages.size === 0) {
            // Usa editReply dopo il defer
            return await interaction.editReply({
                content: 'No recent deletable messages found in the specified amount.',
                ephemeral: true
            });
        }

        try {
            // BulkDelete dei messaggi filtrati. 'true' per silenziare gli errori sui messaggi troppo vecchi.
            const deleted = await interaction.channel.bulkDelete(deletableMessages, true);
            
            // Edita la risposta deferita con il risultato.
            // Aggiungo un messaggio effimero di conferma
            await interaction.editReply({
                content: `<:K3_approved:1400814077596663808> Deleted ${deleted.size} messages.`,
                ephemeral: true
            });

        } catch (error) {
            console.error(error);
            // Edita la risposta deferita in caso di errore.
            await interaction.editReply({
                content: '❌ Error deleting messages. Make sure the bot has the necessary permissions and messages are not too old (Discord does not allow bulk deletion of messages older than 14 days).',
                ephemeral: true
            });
        }
    }
};