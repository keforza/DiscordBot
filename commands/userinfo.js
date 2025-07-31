const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        // Shorten the description to be 100 characters or less
        .setDescription('Mostra informazioni dettagliate su un utente del server. Campi copiabili.') 
        // Or something like: 'Mostra informazioni dettagliate sugli utenti del server, con campi copiabili.'
        // Or even more concise: 'Ottieni info utente (con campi copiabili).'
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

        const roles = targetMember.roles.cache
            .filter(role => role.name !== '@everyone')
            .sort((a, b) => b.position - a.position)
            .map(role => `${role.name}`)
            .join(', ');

        const nickname = targetMember.nickname || 'No nickname';
        const isBoosting = targetMember.premiumSince ? 'Yes' : 'No';

        const accountCreatedDateFormatted = targetUser.createdAt.toLocaleString('en-US', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false
        });
        const joinedServerDateFormatted = targetMember.joinedAt.toLocaleString('en-US', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false
        });

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
        
        const embed = new EmbedBuilder()
            .setColor(0x2B2D31)
            .setAuthor({
                name: `👤 USER INFORMATION 👥`,
                iconURL: targetUser.displayAvatarURL({ dynamic: true })
            })
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
            .setDescription(
                `Mostra i dettagli per ${targetUser.toString()} (ID: \`${targetUser.id}\`)\n\n` +
                `**Stato:** ${targetUser.presence ? targetUser.presence.status.toUpperCase() : 'OFFLINE'}`
            )
            .addFields(
                { name: 'Username', value: `\`\`\`${targetUser.username}\`\`\``, inline: false },
                { name: 'User ID', value: `\`\`\`${targetUser.id}\`\`\``, inline: false },
                
                { 
                    name: `Roles [${targetMember.roles.cache.filter(r => r.id !== interaction.guild.id).size}] (shows up to 10 roles)`, 
                    value: `\`\`\`${roles.length > 0 ? roles : 'No roles'}\`\`\``, 
                    inline: false 
                },

                { name: 'Nickname', value: `\`\`\`${nickname}\`\`\``, inline: false },
                { name: 'Is boosting', value: `\`\`\`${isBoosting}\`\`\``, inline: false },

                { name: 'Global permissions', value: `\`\`\`${globalPermissionsValue}\`\`\``, inline: false }, 

                { 
                    name: 'Joined this server on (MM/DD/YYYY)', 
                    value: `\`\`\`${joinedServerDateFormatted} (${`<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:R>`})\`\`\``, 
                    inline: false 
                },
                { 
                    name: 'Account created on (MM/DD/YYYY)', 
                    value: `\`\`\`${accountCreatedDateFormatted} (${`<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`})\`\`\``, 
                    inline: false 
                }
            );

        await interaction.editReply({ embeds: [embed] });
    }
};