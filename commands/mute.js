const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { parseDuration } = require('../utils/durationParser');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mutes a user for a specified duration and reason')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to mute')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Duration of the mute (e.g., 10m, 1h, 1d, max 28d)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the mute')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers)
        .setDMPermission(false),

    async execute(interaction) {
        // Defer the reply to give the bot time to process
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getMember('user');
        const durationStr = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason specified';

        // Validation checks
        if (!user) return interaction.editReply({ content: '<:K3_wrong:1407992234145611867> User not found in the server.' });
        if (user.id === interaction.user.id) return interaction.editReply({ content: '<:K3_wrong:1407992234145611867> You cannot mute yourself.' });
        if (!user.moderatable) return interaction.editReply({ content: '<:K3_wrong:1407992234145611867> I cannot mute this user. Their role is too high or I am missing permissions.' });

        const durationMs = parseDuration(durationStr);
        if (!durationMs || durationMs > 2419200000) { // Max duration for timeout is 28 days (2,419,200,000 ms)
            return interaction.editReply({ content: '<:K3_wrong:1407992234145611867> Invalid duration. Please use a format like `10m`, `1h`, `1d`, and a maximum of 28 days.' });
        }

        try {
            await user.timeout(durationMs, reason);

            const muteEndTime = new Date(Date.now() + durationMs);
            const formattedEndTime = `<t:${Math.floor(muteEndTime.getTime() / 1000)}:R>`; // Discord's relative timestamp

            // Send a DM to the muted user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('You have been timed out!')
                    .setDescription(`You have been timed out on the server **${interaction.guild.name}** by **${interaction.user.tag}**.`)
                    .addFields(
                        { name: 'Reason', value: reason, inline: true },
                        { name: 'Duration', value: durationStr, inline: true },
                        { name: 'Timeout Ends', value: formattedEndTime, inline: false }
                    )
                    .setTimestamp();
                await user.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.error(`Could not send DM to ${user.user.tag}:`, dmError.message);
            }

            // Public confirmation message
            await interaction.editReply({
                content: `🔇 **${user.user.tag}** has been timed out for **${durationStr}**. Reason: **${reason}**`,
                ephemeral: false // This will be a public message
            });

        } catch (error) {
            console.error('Error muting user:', error);
            await interaction.editReply({ content: '<:K3_wrong:1407992234145611867> An error occurred while timing out the user.' });
        }
    }
};