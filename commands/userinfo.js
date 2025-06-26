// commands/userinfo.js
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'userinfo',
        description: 'Mostra informazioni su un utente',
        // Lasciamo 'ManageMessages' come permesso predefinito se vuoi che solo i moderatori lo usino.
        // Se vuoi che TUTTI i membri possano usarlo, rimuovi questa riga:
        // default_member_permissions: PermissionsBitField.Flags.ManageMessages.toString(),
        dm_permission: false,
        options: [
            {
                name: 'user',
                description: 'Seleziona un utente di cui analizzare le informazioni',
                type: 6, // USER
                required: true
            }
        ]
    },
    async execute(interaction, ephemeralReply) {
        // --- NUOVA RIGA: Deferisce la risposta immediatamente (pubblica per default) ---
        // Rimosso { ephemeral: false } dato che è il default e genera un warning
        await interaction.deferReply(); 

        // Questo check è per la restrizione ai moderatori.
        // Se vuoi che tutti possano usare il comando, rimuovi questo blocco 'if'.
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.editReply(ephemeralReply('🚫 Solo i moderatori possono usare questo comando.'));
        }

        const targetUser = interaction.options.getUser('user'); // L'oggetto User
        let targetMember; // L'oggetto GuildMember

        try {
            // Tenta di ottenere l'oggetto GuildMember per informazioni specifiche del server
            targetMember = await interaction.guild.members.fetch(targetUser.id);
        } catch (error) {
            console.error(`Errore nel recuperare il membro: ${error}`);
            // Se l'utente non è nel server o c'è un errore, gestisci di conseguenza
            return interaction.editReply(ephemeralReply('❌ Impossibile trovare l\'utente specificato in questo server.'));
        }

        // Formatta la lista dei ruoli per essere colorata
        const roles = targetMember.roles.cache
            .filter(role => role.name !== '@everyone') // Esclude il ruolo "@everyone"
            .sort((a, b) => b.position - a.position) // Ordina per posizione (i ruoli più alti prima)
            .map(role => `<@&${role.id}>`) // CAMBIAMENTO FONDAMENTALE: Formatta come menzione di ruolo
            .join(', '); // Unisce con virgola e spazio

        const embed = new EmbedBuilder()
            .setColor('#00AAFF') // Puoi cambiare questo colore se preferisci
            .setTitle(`Info Utente: @${targetUser.username}`) // Titolo come nell'immagine
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: 'ID', value: targetUser.id, inline: true },
                { name: 'Name', value: targetUser.username, inline: true },
                { name: 'Nickname', value: targetMember.nickname || 'Nessuno', inline: true },
                { name: 'Joined Discord', value: `${targetUser.createdAt.toLocaleDateString('it-IT')}`, inline: true },
                { name: 'Joined server', value: `${targetMember.joinedAt.toLocaleDateString('it-IT')}`, inline: true },
                { name: 'Roles', value: roles.length > 0 ? roles : 'Nessuno', inline: false }
            );

        // Invia la risposta finale con l'embed
        await interaction.editReply({ embeds: [embed] });
    }
};