// commands/mute.js
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { parseDuration } = require('../utils/durationParser'); // Import the helper function
const { ensureMuteRole } = require('../utils/roleManager'); // Import the helper function

module.exports = {
    data: {
        name: 'mute',
        description: 'Mutes a user for a specified duration and reason',
        default_member_permissions: PermissionsBitField.Flags.ModerateMembers.toString(),
        dm_permission: false,
        options: [
            {
                name: 'user',
                description: 'User to mute',
                type: 6, // USER
                required: true
            },
            {
                name: 'duration',
                description: 'Duration of the mute (e.g., 10m, 1h, 1d)',
                type: 3, // STRING
                required: true
            },
            {
                name: 'reason',
                description: 'Reason for the mute',
                type: 3, // STRING
                required: false
            }
        ]
    },
    async execute(interaction, ephemeralReply) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply(ephemeralReply('🚫 You do not have permission to mute members.'));
        }

        const user = interaction.options.getMember('user');
        const durationStr = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason specified';

        if (!user) return interaction.reply(ephemeralReply('❌ User not found in the server.'));
        if (user.id === interaction.user.id) return interaction.reply(ephemeralReply('❌ You cannot mute yourself.'));
        if (!user.moderatable) return interaction.reply(ephemeralReply('❌ I cannot mute this user, role too high or missing permissions.'));

        const durationMs = parseDuration(durationStr);
        if (!durationMs) {
            return interaction.reply(ephemeralReply('❌ Invalid duration format. Use e.g., `10m`, `1h`, `1d`.'));
        }

        const muteRole = await ensureMuteRole(interaction.guild);
        if (!muteRole) return interaction.reply(ephemeralReply('❌ Internal error creating/retrieving Muted role.'));

        try {
            if (user.roles.cache.has(muteRole.id)) {
                return interaction.reply(ephemeralReply('❌ User is already muted.'));
            }

            await user.roles.add(muteRole, `Mute by ${interaction.user.tag} for ${reason}`);

            const muteEndTime = new Date(Date.now() + durationMs);
            const formattedEndTime = muteEndTime.toLocaleString('en-US', { // Changed locale to 'en-US' for English formatting
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });

            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('You have been muted!')
                    .setDescription(`You have been muted on the server **${interaction.guild.name}** by **${interaction.user.tag}**.`)
                    .addFields(
                        { name: 'Reason', value: reason, inline: true },
                        { name: 'Duration', value: durationStr, inline: true },
                        { name: 'Mute Ends', value: formattedEndTime }
                    )
                    .setTimestamp();
                await user.send({ embeds: [dmEmbed] });
                await interaction.reply(ephemeralReply(`🔇 ${user.user.tag} has been muted for ${durationStr}. Reason: ${reason}\n✅ User received a DM with details.`));
            } catch (dmError) {
                console.error(`❌ Could not send DM to ${user.user.tag}:`, dmError.message);
                await interaction.reply(ephemeralReply(`🔇 ${user.user.tag} has been muted for ${durationStr}. Reason: ${reason}\n⚠️ Could not send a DM to the user (they might have DMs disabled).`));
            }

            setTimeout(async () => {
                // Check if the user is still muted by this role before removing it
                if (user.roles.cache.has(muteRole.id)) {
                    try {
                        await user.roles.remove(muteRole, 'Automatic mute ended');
                        try {
                            const unmuteDmEmbed = new EmbedBuilder()
                                .setColor('#00FF00')
                                .setTitle('Your mute has ended!')
                                .setDescription(`Your mute on the server **${interaction.guild.name}** has automatically ended. You can now interact again.`);
                            await user.send({ embeds: [unmuteDmEmbed] });
                        } catch (unmuteDmError) {
                            console.error(`❌ Could not send unmute DM to ${user.user.tag}:`, unmuteDmError.message);
                        }
                    } catch (e) {
                        console.error('Error removing automatic mute:', e);
                    }
                }
            }, durationMs);

        } catch (error) {
            console.error('Error muting user:', error);
            interaction.reply(ephemeralReply('❌ Error muting the user.'));
        }
    }
};