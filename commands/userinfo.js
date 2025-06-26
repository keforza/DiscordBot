// commands/userinfo.js
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'userinfo',
        description: 'Mostra informazioni su un utente',
        // Lasciamo 'ManageMessages' come permesso predefinito se vuoi che solo i moderatori lo usino.
        // Se vuoi che TUTTI i membri possano usarlo, rimuovi questa riga:
        // default_member_permissions: PermissionsBitField.Flags.ManageMessages.toString(),
        dm_permission: true,
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
        await interaction.deferReply({ ephemeral: false });

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

        // Calcola gli anni fa per "Joined Discord" e "Joined server"
        const joinedDiscordYearsAgo = Math.floor((Date.now() - targetUser.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        const joinedServerYearsAgo = Math.floor((Date.now() - targetMember.joinedAt.getTime()) / (1000 * 60 * 60 * 24 * 365.25));

        // Formatta la lista dei ruoli
        const roles = targetMember.roles.cache
            .filter(role => role.name !== '@everyone') // Esclude il ruolo "@everyone"
            .sort((a, b) => b.position - a.position) // Ordina per posizione (i ruoli più alti prima)
            .map(role => `\`@${role.name}\``) // Formatta come `@NomeRuolo`
            .join(', '); // Unisce con virgola e spazio

        const embed = new EmbedBuilder()
            .setColor('#00AAFF') // Puoi cambiare questo colore se preferisci
            .setTitle(`Info Utente: @${targetUser.username}`) // Titolo come nell'immagine
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: 'ID', value: targetUser.id, inline: false }, // Messo non inline per maggiore leggibilità
                { name: 'Name', value: targetUser.username, inline: true }, // Nome utente Discord
                { name: 'Nickname', value: targetMember.nickname || 'Nessuno', inline: true }, // Nickname nel server
                { name: 'Joined Discord', value: `${targetUser.createdAt.toLocaleDateString('it-IT')} (${joinedDiscordYearsAgo} anni fa)`, inline: true },
                { name: 'Joined server', value: `${targetMember.joinedAt.toLocaleDateString('it-IT')} (${joinedServerYearsAgo} anni fa)`, inline: true },
                { name: 'Roles', value: roles.length > 0 ? roles : 'Nessuno', inline: false }
            )
            .setTimestamp(); // Aggiunge il timestamp dell'embed

        // --- MODIFICATO: Invia la risposta finale con l'embed, non più effimera ---
        await interaction.editReply({ embeds: [embed] });
    }
};