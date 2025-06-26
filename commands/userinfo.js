// commands/userinfo.js
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'userinfo', // Nome del comando rimane invariato per compatibilità Slash Commands
        description: 'Mostra informazioni su un utente.', // Descrizione del comando in italiano
        // default_member_permissions: PermissionsBitField.Flags.ManageMessages.toString(), // Uncomment to restrict to moderators
        dm_permission: false,
        options: [
            {
                name: 'user', // Nome dell'opzione rimane invariato
                description: 'Seleziona un utente di cui visualizzare le informazioni.', // Descrizione dell'opzione in italiano
                type: 6, // USER
                required: true
            }
        ]
    },
    async execute(interaction) { 
        await interaction.deferReply(); 

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.editReply({ content: '🚫 Only moderators can use this command.', ephemeral: true });
        }

        const targetUser = interaction.options.getUser('user');
        let targetMember;

        try {
            targetMember = await interaction.guild.members.fetch(targetUser.id);
        } catch (error) {
            console.error(`Error fetching member: ${error}`);
            return interaction.editReply({ content: '❌ Unable to find the specified user in this server.', ephemeral: true });
        }

        const roles = targetMember.roles.cache
            .filter(role => role.name !== '@everyone')
            .sort((a, b) => b.position - a.position)
            .map(role => `<@&${role.id}>`)
            .join(', ');

        const rolesCount = targetMember.roles.cache.filter(role => role.name !== '@everyone').size;
        const nickname = targetMember.nickname || 'None';
        const isBoosting = targetMember.premiumSince ? 'Yes' : 'No';

        const accountCreatedDate = targetUser.createdAt.toLocaleString('en-US', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });

        const joinedServerDate = targetMember.joinedAt.toLocaleString('en-US', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });

        const embed = new EmbedBuilder()
            .setColor('#00AAFF')
            .setTitle(`User Information 👤`)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: 'Nickname', value: `\`${nickname}\``, inline: true },
                { name: 'Username', value: `\`${targetUser.username}\``, inline: true },
                { name: 'User ID', value: `\`${targetUser.id}\``, inline: true },
                { name: 'Roles', value: roles.length > 0 ? `${rolesCount} - ${roles}` : 'None', inline: false },
                { name: 'Is Boosting', value: `\`${isBoosting}\``, inline: true },
                { name: 'Joined Discord', value: `\`${accountCreatedDate}\``, inline: false },
                { name: 'Joined Server', value: `\`${joinedServerDate}\``, inline: false }
            );

        await interaction.editReply({ embeds: [embed] });
    }
};