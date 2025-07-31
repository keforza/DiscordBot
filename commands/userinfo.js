const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

// Helper function to calculate relative time in English
function getRelativeTimeAgo(date) {
    const now = new Date();
    const diff = now.getTime() - date.getTime(); // Difference in milliseconds

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const years = Math.floor(days / 365.25);
    const months = Math.floor(days / 30.44);

    let result = [];

    if (years > 0) {
        result.push(`${years} year${years === 1 ? '' : 's'}`);
    }
    const remainingMonths = months % 12;
    if (remainingMonths > 0 && years < 10) { 
        result.push(`${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`);
    }
    
    if (years === 0 && months === 0 && days > 0) {
        result.push(`${days} day${days === 1 ? '' : 's'}`);
    } else if (years === 0 && months === 0 && days === 0 && hours > 0) {
        result.push(`${hours} hour${hours === 1 ? '' : 's'}`);
    } else if (years === 0 && months === 0 && days === 0 && hours === 0 && minutes > 0) {
        result.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
    } else if (years === 0 && months === 0 && days === 0 && hours === 0 && minutes === 0 && seconds > 0) {
        result.push(`${seconds} second${seconds === 1 ? '' : 's'}`);
    } else if (result.length === 0) {
        return "less than a minute";
    }

    return result.join(' and ') + ' ago'; 
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Shows detailed information about a server user. All fields copyable.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Select a user to display information for (default: yourself).')
                .setRequired(false)),

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
            // *************** MODIFICA QUI: Mappa il ruolo come menzione per il colore ***************
            .map(role => `<@&${role.id}>`) 
            // ****************************************************************************************
            .join(', ');

        const nickname = targetMember.nickname || 'No nickname';
        const isBoosting = targetMember.member.premiumSince ? 'Yes' : 'No'; // Ho corretto targetMember.premiumSince

        // Date format: MM/DD/YYYY HH:MM (no comma)
        const dateOptions = {
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
        };

        const accountCreatedDateFormatted = targetUser.createdAt.toLocaleString('en-US', dateOptions).replace(', ', ' ');
        const joinedServerDateFormatted = targetMember.joinedAt.toLocaleString('en-US', dateOptions).replace(', ', ' ');

        const accountCreatedPeriod = getRelativeTimeAgo(targetUser.createdAt);
        const joinedServerPeriod = getRelativeTimeAgo(targetMember.joinedAt);

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
        
        // --- Build the Embed ---
        const embed = new EmbedBuilder()
            .setColor(0x2B2D31) 
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 })) 
            .addFields(
                { name: 'Username', value: `\`\`\`${targetUser.username}\`\`\``, inline: false },
                { name: 'User ID', value: `\`\`\`${targetUser.id}\`\`\``, inline: false },
                
                { 
                    name: `Roles [${targetMember.roles.cache.filter(r => r.id !== interaction.guild.id).size}] (shows up to 10 roles)`, 
                    value: `\`\`\`${roles.length > 0 ? roles : 'No roles'}\`\`\``, 
                    inline: false 
                },

                { name: 'Nickname', value: `\`\`\`${nickname}\`\`\``, inline: false },
                { name: 'Is boosting', value: `\`\`\`${isBoosting}\`\`\``, inline: false }, // Corretto qui

                { name: 'Global permissions', value: `\`\`\`${globalPermissionsValue}\`\`\``, inline: false }, 

                { 
                    name: 'Joined this server on (MM/DD/YYYY)', 
                    value: `\`\`\`${joinedServerDateFormatted} (${joinedServerPeriod})\`\`\``, 
                    inline: false 
                },
                { 
                    name: 'Account created on (MM/DD/YYYY)', 
                    value: `\`\`\`${accountCreatedDateFormatted} (${accountCreatedPeriod})\`\`\``, 
                    inline: false 
                }
            );

        await interaction.editReply({ embeds: [embed] });
    }
};