const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Mostra informazioni dettagliate su un utente del server. Tutti i campi copiabili.') // Descrizione accorciata
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Seleziona un utente di cui visualizzare le informazioni (predefinito: te stesso).')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply(); 

        const targetUser = interaction.options.getUser('user') || interaction.user;
        let targetMember;

        try {
            targetMember = await interaction.guild.members.fetch(targetUser.id);
        } catch (error) {
            console.error(`Errore nel recupero del membro per l'utente ${targetUser.id}: ${error}`);
            return interaction.editReply({ content: '❌ Impossibile trovare l\'utente specificato in questo server.' });
        }

        // --- Preparazione dei Dati per l'Embed ---

        const roles = targetMember.roles.cache
            .filter(role => role.name !== '@everyone')
            .sort((a, b) => b.position - a.position)
            .map(role => `${role.name}`)
            .join(', ');

        const nickname = targetMember.nickname || 'No nickname';
        const isBoosting = targetMember.premiumSince ? 'Yes' : 'No';

        // Formattazione delle date: MM/DD/YYYY HH:MM (senza virgola)
        const dateOptions = {
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false // Formato 24 ore
        };

        // *************** LINEA CORRETTA QUI ***************
        // Sostituisce ", " (virgola e spazio) con un singolo spazio
        const accountCreatedDateFormatted = targetUser.createdAt.toLocaleString('en-US', dateOptions).replace(', ', ' ');
        const joinedServerDateFormatted = targetMember.joinedAt.toLocaleString('en-US', dateOptions).replace(', ', ' ');
        // *************************************************

        // Ottieni i timestamp Unix per le date relative di Discord
        const accountCreatedTimestamp = Math.floor(targetUser.createdTimestamp / 1000);
        const joinedServerTimestamp = Math.floor(targetMember.joinedTimestamp / 1000);

        let globalPermissionsValue = 'None';
        if (targetMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
            globalPermissionsValue = '👑 Administrator (all permissions)';
        } else {
            const readablePermissions = targetMember.permissions.toArray()
                .map(perm => perm.replace(/([A-Z])/g, ' $1').trim())
                .join(', ');
            if (readablePermissions.length > 0) {
                globalPermissionsValue = readablePermissions;
            }
        }
        
        // --- Costruzione dell'Embed ---
        const embed = new EmbedBuilder()
            .setColor(0x2B2D31) // Colore scuro per replicare lo stile dei blocchi di codice
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 })) // Il thumbnail rimane
            .addFields(
                // Username e User ID (campi copiabili a piena larghezza)
                { name: 'Username', value: `\`\`\`${targetUser.username}\`\`\``, inline: false },
                { name: 'User ID', value: `\`\`\`${targetUser.id}\`\`\``, inline: false },
                
                // Ruoli (campo copiabile a piena larghezza)
                { 
                    name: `Roles [${targetMember.roles.cache.filter(r => r.id !== interaction.guild.id).size}] (shows up to 10 roles)`, 
                    value: `\`\`\`${roles.length > 0 ? roles : 'No roles'}\`\`\``, 
                    inline: false 
                },

                // Nickname e Is boosting (campi copiabili a piena larghezza)
                { name: 'Nickname', value: `\`\`\`${nickname}\`\`\``, inline: false },
                { name: 'Is boosting', value: `\`\`\`${isBoosting}\`\`\``, inline: false },

                // Permessi Globali (campo copiabile a piena larghezza)
                { name: 'Global permissions', value: `\`\`\`${globalPermissionsValue}\`\`\``, inline: false }, 

                // Date (campi copiabili a piena larghezza con formattazione richiesta)
                { 
                    name: 'Joined this server on (MM/DD/YYYY)', 
                    value: `\`\`\`${joinedServerDateFormatted} (<t:${joinedServerTimestamp}:R>)\`\`\``, 
                    inline: false 
                },
                { 
                    name: 'Account created on (MM/DD/YYYY)', 
                    value: `\`\`\`${accountCreatedDateFormatted} (<t:${accountCreatedTimestamp}:R>)\`\`\``, 
                    inline: false 
                }
            );

        await interaction.editReply({ embeds: [embed] });
    }
};