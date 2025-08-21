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
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the unmute')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers)
        .setDMPermission(false),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason');

        if (!user) {
            return interaction.editReply({ content: '<:K3_wrong:1407992234145611867> User not found in the server.' });
        }

        const muteRole = await ensureMuteRole(interaction.guild);
        if (!muteRole) {
            return interaction.editReply({ content: '<:K3_wrong:1407992234145611867> Muted role not found or created.' });
        }

        if (!user.roles.cache.has(muteRole.id)) {
            return interaction.editReply({ content: '<:K3_wrong:1407992234145611867> User is not muted.' });
        }

        try {
            await user.roles.remove(muteRole, `Unmute by ${interaction.user.tag} for ${reason}`);
            
            // Send public confirmation
            await interaction.editReply({ 
                content: `🔊 ${user.user.tag} has been unmuted. Reason: **${reason}**`,
                ephemeral: false
            });

            // Send DM to the unmuted user
            try {
                const unmuteDmEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('You got unmuted 🔊')
                    .addFields(
                        { name: 'Reason', value: `\`${reason}\``, inline: false },
                        { name: 'Responsible', value: `\`${interaction.user.tag}\``, inline: true }
                    )
                    .setTimestamp();
                await user.send({ embeds: [unmuteDmEmbed] });
            } catch (dmError) {
                console.error(`<:K3_wrong:1407992234145611867> Could not send unmute DM to ${user.user.tag}:`, dmError.message);
            }
        } catch (error) {
            console.error('Error removing mute:', error);
            interaction.editReply({ content: '<:K3_wrong:1407992234145611867> Error removing mute. Check bot permissions.' });
        }
    }
};