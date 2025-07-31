const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Mostra informazioni dettagliate su un utente del server, con campi copiabili.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Seleziona un utente di cui visualizzare le informazioni (predefinito: te stesso).')
                .setRequired(false)),

    async execute(interaction) {
        // Differisce la risposta pubblicamente
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

        // Ruoli: usa il nome del ruolo per la copiatura, non la menzione
        const roles = targetMember.roles.cache
            .filter(role => role.name !== '@everyone')
            .sort((a, b) => b.position - a.position)
            .map(role => `${role.name}`) // Usiamo il nome del ruolo per renderlo copiabile
            .join(', ');

        const nickname = targetMember.nickname || 'No nickname';
        const isBoosting = targetMember.premiumSince ? 'Yes' : 'No';

        // Formatta le date come MM/DD/YYYY HH:MM (come nell'immagine)
        const accountCreatedDateFormatted = targetUser.createdAt.toLocaleString('en-US', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false // Formato 24 ore
        });
        const joinedServerDateFormatted = targetMember.joinedAt.toLocaleString('en-US', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false
        });

        // Prepara la stringa dei permessi globali
        let globalPermissionsValue = 'None';
        if (targetMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
            globalPermissionsValue = '👑 Administrator (all permissions)';
        } else {
            // Se non è amministratore, elenca tutti i permessi leggibili (può essere lungo)
            const readablePermissions = targetMember.permissions.toArray()
                .map(perm => perm.replace(/([A-Z])/g, ' $1').trim()) // Converte da camelCase a leggibile (es. ManageMessages -> Manage Messages)
                .join(', ');
            if (readablePermissions.length > 0) {
                globalPermissionsValue = readablePermissions;
            }
        }
        
        // --- Costruzione dell'Embed per Replicare lo Stile dell'Immagine ---
        const embed = new EmbedBuilder()
            .setColor(0x2B2D31) // Un colore scuro, simile allo sfondo delle "caselle" di Discord
            .setAuthor({
                // Testo e icone esattamente come nell'immagine fornita
                name: `👤 USER INFORMATION 👥`,
                iconURL: targetUser.displayAvatarURL({ dynamic: true }) // Usa l'avatar dell'utente come icona dell'autore
            })
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                // Username e User ID - inline
                { name: 'Username', value: `\`✨${targetUser.username}✨\``, inline: true }, // Aggiunto emoji per richiamare l'immagine
                { name: 'User ID', value: `\`${targetUser.id}\``, inline: true },
                
                // Ruoli - piena larghezza (multiline code block)
                { 
                    name: `Roles [${targetMember.roles.cache.filter(r => r.id !== interaction.guild.id).size}] (shows up to 10 roles)`, 
                    value: `\`\`\`${roles.length > 0 ? roles : 'No roles'}\`\`\``, 
                    inline: false 
                },

                // Nickname e Is boosting - inline
                { name: 'Nickname', value: `\`${nickname}\``, inline: true },
                { name: 'Is boosting', value: `\`${isBoosting}\``, inline: true },
                { name: '\u200B', value: '\u200B', inline: true }, // Campo vuoto per allineamento

                // Permessi Globali - piena larghezza (multiline code block)
                { name: 'Global permissions', value: `\`\`\`${globalPermissionsValue}\`\`\``, inline: false }, 

                // Date - piena larghezza
                { 
                    name: 'Joined this server on (MM/DD/YYYY)', 
                    value: `\`${joinedServerDateFormatted} (${`<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:R>`})\``, 
                    inline: false 
                },
                { 
                    name: 'Account created on (MM/DD/YYYY)', 
                    value: `\`${accountCreatedDateFormatted} (${`<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`})\``, 
                    inline: false 
                }
            );
            // Non ho aggiunto footer o timestamp al footer per replicare esattamente l'immagine fornita.
            // Se li vuoi, puoi aggiungerli con .setFooter().setTimestamp()

        await interaction.editReply({ embeds: [embed] });
    }
};