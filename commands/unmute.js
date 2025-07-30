// commands/unmute.js
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { ensureMuteRole } = require('../utils/roleManager'); // Import the helper function

module.exports = {
    data: {
        name: 'unmute',
        description: 'Unmutes a user',
        default_member_permissions: PermissionsBitField.Flags.ModerateMembers.toString(),
        dm_permission: false,
        options: [
            {
                name: 'user',
                description: 'User to unmute',
                type: 6, // USER
                required: true
            }
        ]
    },
    async execute(interaction, ephemeralReply) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply(ephemeralReply('🚫 You do not have permission to unmute members.'));
        }

        const user = interaction.options.getMember('user');
        if (!user) return interaction.reply(ephemeralReply('❌ User not found in the server.'));

        const muteRole = await ensureMuteRole(interaction.guild); // Use the helper function
        if (!muteRole) return interaction.reply(ephemeralReply('❌ Muted role not found or created.'));

        if (!user.roles.cache.has(muteRole.id)) {
            return interaction.reply(ephemeralReply('❌ User is not muted.'));
        }

        try {
            await user.roles.remove(muteRole, `Unmute by ${interaction.user.tag}`);
            await interaction.reply(ephemeralReply(`🔈 ${user.user.tag} has been unmuted.`));

            try {
                const unmuteDmEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('You have been unmuted!')
                    .setDescription(`You have been manually unmuted on the server **${interaction.guild.name}** by **${interaction.user.tag}**. You can now interact again.`);
                await user.send({ embeds: [unmuteDmEmbed] });
            } catch (dmError) {
                console.error(`❌ Could not send unmute DM to ${user.user.tag}:`, dmError.message);
            }
        } catch (error) {
            console.error('Error removing mute:', error);
            interaction.reply(ephemeralReply('❌ Error removing mute.'));
        }
    }
};