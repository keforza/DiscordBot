// commands/unmute.js
const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { ensureMuteRole } = require('../utils/roleManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmutes a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to unmute')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers)
        .setDMPermission(false),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getMember('user');
        if (!user) {
            return interaction.editReply({ content: '❌ User not found in the server.' });
        }

        const muteRole = await ensureMuteRole(interaction.guild);
        if (!muteRole) {
            return interaction.editReply({ content: '❌ Muted role not found or created.' });
        }

        if (!user.roles.cache.has(muteRole.id)) {
            return interaction.editReply({ content: '❌ User is not muted.' });
        }

        try {
            await user.roles.remove(muteRole, `Unmute by ${interaction.user.tag}`);
            
            // Send public confirmation
            await interaction.editReply({ 
                content: `🔈 ${user.user.tag} has been unmuted.`,
                ephemeral: false
            });

            // Try to send a DM to the unmuted user
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
            interaction.editReply({ content: '❌ Error removing mute. Check bot permissions.' });
        }
    }
};