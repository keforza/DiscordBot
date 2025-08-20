const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    // Usiamo SlashCommandBuilder per una definizione del comando più chiara e moderna
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Cancella un numero di messaggi')
        .addIntegerOption(option =>
            option.setName('numero')
                .setDescription('Numero di messaggi da cancellare (massimo 100)')
                .setRequired(true)
                .setMinValue(1) // Aggiungiamo un limite minimo
                .setMaxValue(100) // Aggiungiamo un limite massimo
        )
        .addUserOption(option =>
            option.setName('utente')
                .setDescription('Cancella messaggi da un utente specifico')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
        .setDMPermission(false),

    async execute(interaction) {
        // Defer della risposta (effimera, visibile solo all'utente)
        await interaction.deferReply({ ephemeral: true });

        const count = interaction.options.getInteger('numero');
        const member = interaction.options.getMember('utente');

        // Se è stato specificato un utente, cerchiamo un numero maggiore di messaggi per avere un buffer
        const fetchLimit = member ? 100 : count;

        let messages = await interaction.channel.messages.fetch({ limit: fetchLimit });
        let deletableMessages;

        if (member) {
            // Se un utente è stato specificato, filtriamo i messaggi solo di quell'utente
            deletableMessages = messages.filter(
                msg => msg.author.id === member.id && !msg.pinned && msg.deletable
            ).first(count); // Prendiamo solo il numero di messaggi richiesto
        } else {
            // Altrimenti, filtriamo tutti i messaggi deletabili
            deletableMessages = messages.filter(
                msg => !msg.pinned && msg.deletable
            );
        }

        // Gestione del caso in cui non ci sono messaggi da cancellare
        if (deletableMessages.size === 0) {
            return await interaction.editReply({
                content: '❌ Nessun messaggio recente da cancellare trovato in base ai criteri specificati.',
            });
        }
        
        try {
            const deleted = await interaction.channel.bulkDelete(deletableMessages, true);
            
            // Messaggio di conferma con il numero di messaggi cancellati
            await interaction.editReply({
                content: `<:K3_approved:1400814077596663808> Ho cancellato **${deleted.size}** messaggi.`,
            });

        } catch (error) {
            console.error('Errore durante la cancellazione dei messaggi:', error);
            await interaction.editReply({
                content: '❌ Errore durante la cancellazione dei messaggi. Assicurati che il bot abbia i permessi necessari e che i messaggi non siano più vecchi di 14 giorni.',
            });
        }
    }
};