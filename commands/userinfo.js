const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Mostra informazioni dettagliate su un utente del server in modo leggibile.')
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
            .map(role => `${role}`)
            .join(', ');

        const nickname = targetMember.nickname || 'Nessuno';
        const isBoosting = targetMember.premiumSince ? 'Sì' : 'No';

        // Prepara la stringa dei permessi globali
        let globalPermissionsValue = 'Nessuno';
        if (targetMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
            globalPermissionsValue = '👑 Amministratore (tutti i permessi)';
        } else {
            const readablePermissions = targetMember.permissions.toArray()
                .map(perm => perm.replace(/([A-Z])/g, ' $1').trim())
                .join(', ');
            if (readablePermissions.length > 0) {
                globalPermissionsValue = readablePermissions;
            }
        }
        
        // --- Formattazione delle Date Esatta come Richiesto ---
        const dateOptions = {
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false // Formato 24 ore
        };

        // Formatta la data e l'ora, poi rimuovi la virgola e lo spazio dopo la data
        const accountCreatedDateFormatted = targetUser.createdAt.toLocaleString('en-US', dateOptions).replace(', ', ' ');
        const joinedServerDateFormatted = targetMember.joinedAt.toLocaleString('en-US', dateOptions).replace(', ', ' ');

        // Ottieni i timestamp Unix per le date relative di Discord
        const accountCreatedTimestamp = Math.floor(targetUser.createdTimestamp / 1000);
        const joinedServerTimestamp = Math.floor(targetMember.joinedTimestamp / 1000);

        // --- Costruzione dell'Embed ---
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setAuthor({
                name: `Informazioni Utente: ${targetUser.username}`,
                iconURL: targetUser.displayAvatarURL({ dynamic: true })
            })
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
            .setDescription(
                `**ID:** \`${targetUser.id}\`\n` +
                `**Stato:** ${targetUser.presence ? targetUser.presence.status.toUpperCase() : 'OFFLINE'}`
            )
            .addFields(
                { name: 'Username Discord', value: `\`${targetUser.globalName || targetUser.username}\``, inline: true },
                { name: 'Nickname nel Server', value: `\`${nickname}\``, inline: true },
                { name: 'Bot?', value: targetUser.bot ? '✅ Sì' : '❌ No', inline: true },
                
                { name: '\u200B', value: '__Date Importanti__', inline: false },

                // Date con la formattazione richiesta: MM/DD/YYYY HH:MM (tempo relativo)
                { 
                    name: 'Account Discord Creato', 
                    value: `\`${accountCreatedDateFormatted} (<t:${accountCreatedTimestamp}:R>)\``, 
                    inline: false 
                },
                { 
                    name: 'Unito al Server', 
                    value: `\`${joinedServerDateFormatted} (<t:${joinedServerTimestamp}:R>)\``, 
                    inline: false 
                },

                { name: '\u200B', value: '__Dettagli del Server__', inline: false },
                
                { name: 'Sta Boostando il Server?', value: `\`${isBoosting}\``, inline: true },
                { name: `Ruoli (${targetMember.roles.cache.filter(r => r.id !== interaction.guild.id).size})`, value: roles.length > 0 ? `${roles}` : 'Nessuno', inline: false },
                
                { name: 'Permessi Globali', value: `\`${globalPermissionsValue}\``, inline: false }
            )
            .setFooter({
                text: `Info richiesta da ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};