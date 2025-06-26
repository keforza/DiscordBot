// commands/userinfo.js
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'userinfo',
        description: 'Visualizza le info di un utente', 
        // If you want ALL members to be able to use this command, remove this line:
        // default_member_permissions: PermissionsBitField.Flags.ManageMessages.toString(),
        dm_permission: false,
        options: [
            {
                name: 'user',
                description: 'Digita un utente di cui vedere le info', 
                type: 6, // USER
                required: true
            }
        ]
    },
    async execute(interaction) { 
        await interaction.deferReply(); 

        // This check is for moderator restriction.
        // If you want everyone to be able to use the command, remove this 'if' block and the 'default_member_permissions' line above.
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.editReply({ content: '🚫 Only moderators can use this command.', ephemeral: true }); // English
        }

        const targetUser = interaction.options.getUser('user'); // The User object
        let targetMember; // The GuildMember object

        try {
            // Attempt to fetch the GuildMember object for server-specific information
            targetMember = await interaction.guild.members.fetch(targetUser.id);
        } catch (error) {
            console.error(`Error fetching member: ${error}`); // English
            // If the user is not in the server or there's an error
            return interaction.editReply({ content: '❌ Unable to find the specified user in this server.', ephemeral: true }); // English
        }

        // Format the list of roles to be colored
        const roles = targetMember.roles.cache
            .filter(role => role.name !== '@everyone') // Exclude the "@everyone" role
            .sort((a, b) => b.position - a.position) // Sort by position (highest roles first)
            .map(role => `<@&${role.id}>`) // Format as role mention to get color
            .join(', '); // Join with comma and space

        const rolesCount = targetMember.roles.cache.filter(role => role.name !== '@everyone').size;
        
        // Nickname
        const nickname = targetMember.nickname || 'None'; // English

        // Check if the user is boosting the server
        const isBoosting = targetMember.premiumSince ? 'Yes' : 'No'; // English

        // Format dates without "time ago"
        const accountCreatedDate = targetUser.createdAt.toLocaleString('en-US', { // English locale
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });

        const joinedServerDate = targetMember.joinedAt.toLocaleString('en-US', { // English locale
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });

        const embed = new EmbedBuilder()
            .setColor('#00AAFF') // Keeping original color
            .setTitle(`User Information 👤`) // Title updated as per image (English)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 })) // Size for clarity
            .addFields(
                // Values are now wrapped in backticks (`) to create the copyable black boxes
                { name: 'Username', value: `\`${targetUser.username}\``, inline: true }, // English
                { name: 'User ID', value: `\`${targetUser.id}\``, inline: true }, // English
                // Roles are not in black boxes in the image, so we leave them as mentions
                { name: 'Roles', value: roles.length > 0 ? `${rolesCount} - ${roles}` : 'None', inline: false }, // English (count added)
                { name: 'Nickname', value: `\`${nickname}\``, inline: true }, // English
                { name: 'Is Boosting', value: `\`${isBoosting}\``, inline: true }, // English
                { name: 'Account Created On', value: `\`${accountCreatedDate}\``, inline: false }, // English title and formatted date
                { name: 'Joined Server On', value: `\`${joinedServerDate}\``, inline: false } // English title and formatted date
            );

        await interaction.editReply({ embeds: [embed] });
    }
};