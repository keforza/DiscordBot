const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

// Helper function to calculate relative time in Italian
function getRelativeTimeAgo(date) {
    const now = new Date();
    const diff = now.getTime() - date.getTime(); // Differenza in millisecondi

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const years = Math.floor(days / 365.25);
    const months = Math.floor(days / 30.44);

    let result = [];

    if (years > 0) {
        result.push(`${years} anno${years === 1 ? '' : 'i'}`);
    }
    const remainingMonths = months % 12;
    if (remainingMonths > 0 && years < 10) { 
        result.push(`${remainingMonths} mese${remainingMonths === 1 ? '' : 'i'}`);
    }
    
    if (years === 0 && months === 0 && days > 0) {
        result.push(`${days} giorno${days === 1 ? '' : 'i'}`);
    } else if (years === 0 && months === 0 && days === 0 && hours > 0) {
        result.push(`${hours} ora${hours === 1 ? '' : 'e'}`);
    } else if (years === 0 && months === 0 && days === 0 && hours === 0 && minutes > 0) {
        result.push(`${minutes} minuto${minutes === 1 ? '' : 'i'}`);
    } else if (years === 0 && months === 0 && days === 0 && hours === 0 && minutes === 0 && seconds > 0) {
        result.push(`${seconds} secondo${seconds === 1 ? '' : 'i'}`);
    } else if (result.length === 0) {
        return "meno di un minuto";
    }

    return result.join(' e ') + ' fa'; 
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Shows detailed information about a server user. All fields copyable.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Select a user to display information for (default: yourself).')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers) // Solo utenti con permesso KickMembers
        .setDMPermission(false), // Questo comando non può essere usato nei DM

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: false }); 
        } catch (error) {
            console.error("Error in deferReply:", error);
            return; 
        }

        const targetUser = interaction.options.getUser('user') || interaction.user;
        let targetMember;

        try {
            targetMember = await interaction.guild.members.fetch(targetUser.id);
        } catch (error) {
            console.error(`Error fetching member for user ${targetUser.id}: ${error}`);
            return interaction.editReply({ content: '❌ Could not find the specified user on this server.', ephemeral: true });
        }

        // --- Prepare Embed Data ---

        const roles = targetMember.roles.cache
            .filter(role => role.name !== '@everyone')
            .sort((a, b) => b.position - a.position)
            .map(role => `<@&${role.id}>`) 
            .join(', ');

        const nickname = targetMember.nickname || 'No nickname';
        const isBoosting = targetMember.premiumSince ? 'Sì' : 'No'; // Tradotto 'Yes'/'No' in italiano

        // Date format: GG/MM/AA HH:MM
        const dateOptions = {
            year: '2-digit', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
        };

        const accountCreatedDateFormatted = targetUser.createdAt.toLocaleString('it-IT', dateOptions);
        const joinedServerDateFormatted = targetMember.joinedAt.toLocaleString('it-IT', dateOptions);

        const accountCreatedPeriod = getRelativeTimeAgo(targetUser.createdAt);
        const joinedServerPeriod = getRelativeTimeAgo(targetMember.joinedAt);

        let globalPermissionsValue = 'Nessuno'; // Tradotto 'None'
        if (targetMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
            globalPermissionsValue = '👑 Amministratore (tutti i permessi)'; // Tradotto
        } else {
            const readablePermissions = targetMember.permissions.toArray()
                .map(perm => perm.replace(/([A-Z])/g, ' $1').trim())
                .join(', ');
            if (readablePermissions.length > 0) {
                globalPermissionsValue = readablePermissions;
            }
        }
        
        // --- Build the Embed ---
        const embed = new EmbedBuilder()
            .setColor(0x2B2D31) 
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 })) 
            .addFields(
                { name: 'Username', value: `\`\`\`${targetUser.username}\`\`\``, inline: false },
                { name: 'User ID', value: `\`\`\`${targetUser.id}\`\`\``, inline: false },
                
                { 
                    name: `Ruoli [${targetMember.roles.cache.filter(r => r.id !== interaction.guild.id).size}]`, // Tradotto 'Roles'
                    value: roles.length > 0 ? roles : 'Nessun ruolo', // Tradotto 'No roles'
                    inline: false 
                },

                { name: 'Nickname', value: `\`\`\`${nickname}\`\`\``, inline: false },
                { name: 'Sta boostando', value: `\`\`\`${isBoosting}\`\`\``, inline: false }, // Tradotto 'Is boosting'

                { name: 'Permessi globali', value: `\`\`\`${globalPermissionsValue}\`\`\``, inline: false }, // Tradotto 'Global permissions'

                { 
                    name: 'Entrato nel server il (GG/MM/AA)', // Aggiornato formato data e tradotto
                    value: `\`\`\`${joinedServerDateFormatted} (${joinedServerPeriod})\`\`\``, 
                    inline: false 
                },
                { 
                    name: 'Account creato il (GG/MM/AA)', // Aggiornato formato data e tradotto
                    value: `\`\`\`${accountCreatedDateFormatted} (${accountCreatedPeriod})\`\`\``, 
                    inline: false 
                }
            );

        await interaction.editReply({ embeds: [embed] });
    }
};