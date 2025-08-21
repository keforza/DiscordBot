// commands/unmute.js (Updated for timeout)
const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

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

        if (!user.isCommunicationDisabled()) {
            return interaction.editReply({ content: '❌ User is not timed out.' });
        }

        try {
            await user.timeout(null, `Unmute by ${interaction.user.tag}`);
            
            await interaction.editReply({ 
                content: `🔈 ${user.user.tag} has been unmuted.`,
                ephemeral: false
            });

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
            console.error('Error removing timeout:', error);
            interaction.editReply({ content: '❌ Error removing timeout. Check bot permissions.' });
        }
    }
};