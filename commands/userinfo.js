// commands/userinfo.js
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'userinfo',
        description: 'Mostra informazioni su un utente',
        // Se vuoi che TUTTI i membri possano usare questo comando, rimuovi questa riga:
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
    // Rimosso 'ephemeralReply' come parametro
    async execute(interaction) { 
        // Deferisce la risposta. Se vuoi che la risposta iniziale sia effimera, usa:
        // await interaction.deferReply({ ephemeral: true });
        // Per ora, lo lasciamo pubblico come nel tuo codice.
        await interaction.deferReply(); 

        // Questo check è per la restrizione ai moderatori.
        // Se vuoi che tutti possano usare il comando, rimuovi questo blocco 'if' e la riga 'default_member_permissions' sopra.
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            // Qui usiamo interaction.editReply con { ephemeral: true }
            return interaction.editReply({ content: '🚫 Solo i moderatori possono usare questo comando.', ephemeral: true }); 
        }

        const targetUser = interaction.options.getUser('user'); // L'oggetto User
        let targetMember; // L'oggetto GuildMember

        try {
            // Tenta di ottenere l'oggetto GuildMember per informazioni specifiche del server
            targetMember = await interaction.guild.members.fetch(targetUser.id);
        } catch (error) {
            console.error(`Errore nel recuperare il membro: ${error}`);
            // Se l'utente non è nel server o c'è un errore
            return interaction.editReply({ content: '❌ Impossibile trovare l\'utente specificato in questo server.', ephemeral: true });
        }

        // Formatta la lista dei ruoli per essere colorata
        const roles = targetMember.roles.cache
            .filter(role => role.name !== '@everyone') // Esclude il ruolo "@everyone"
            .sort((a, b) => b.position - a.position) // Ordina per posizione (i ruoli più alti prima)
            .map(role => `<@&${role.id}>`) // Formatta come menzione di ruolo per avere il colore
            .join(', '); // Unisce con virgola e spazio

        const rolesCount = targetMember.roles.cache.filter(role => role.name !== '@everyone').size;
        
        // Nickname
        const nickname = targetMember.nickname || 'Nessuno';

        // Verifica se l'utente sta boostando il server
        const isBoosting = targetMember.premiumSince ? 'Sì' : 'No';

        // Formatta le date senza il "tempo fa"
        const accountCreatedDate = targetUser.createdAt.toLocaleString('it-IT', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });

        const joinedServerDate = targetMember.joinedAt.toLocaleString('it-IT', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });

        const embed = new EmbedBuilder()
            .setColor('#00AAFF') // Mantenuto il colore originale
            .setTitle(`Informazioni Utente 👤`) // Titolo aggiornato come nell'immagine
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 })) // Dimensione per chiarezza
            .addFields(
                // I valori sono ora avvolti in backticks (`) per creare i riquadri neri copiabili
                { name: 'Username', value: `\`${targetUser.username}\``, inline: true },
                { name: 'ID Utente', value: `\`${targetUser.id}\``, inline: true },
                // I ruoli non sono in riquadri neri nell'immagine, quindi li lasciamo come menzioni
                { name: 'Ruoli', value: roles.length > 0 ? `${rolesCount} - ${roles}` : 'Nessuno', inline: false }, 
                { name: 'Nickname', value: `\`${nickname}\``, inline: true },
                { name: 'Sta boostando', value: `\`${isBoosting}\``, inline: true },
                { name: 'Unito a Discord (Creazione Account)', value: `\`${accountCreatedDate}\``, inline: false },
                { name: 'Unito al Server', value: `\`${joinedServerDate}\``, inline: false }
            );

        await interaction.editReply({ embeds: [embed] });
    }
};