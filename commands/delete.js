const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    // Use SlashCommandBuilder for a clean and modern command definition
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Deletes a number of messages.')
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('Number of messages to delete (max 100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Deletes messages from a specific user')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
        .setDMPermission(false),

    async execute(interaction) {
        // Defer the reply (ephemeral, only visible to the user)
        await interaction.deferReply({ ephemeral: true });

        const count = interaction.options.getInteger('count');
        const user = interaction.options.getMember('user');

        // If a user is specified, fetch a larger number of messages to find the ones to delete
        const fetchLimit = user ? 100 : count;

        const messages = await interaction.channel.messages.fetch({ limit: fetchLimit });
        let deletableMessages;

        if (user) {
            // If a user is specified, filter messages only from that user
            deletableMessages = messages.filter(
                msg => msg.author.id === user.id && !msg.pinned && msg.deletable
            ).first(count); // Take only the requested number of messages
        } else {
            // Otherwise, filter all deletable messages
            deletableMessages = messages.filter(
                msg => !msg.pinned && msg.deletable
            );
        }

        // Handle the case where no messages can be deleted
        if (deletableMessages.size === 0) {
            return await interaction.editReply({
                content: '❌ No recent deletable messages found based on the specified criteria.',
            });
        }
        
        try {
            const deleted = await interaction.channel.bulkDelete(deletableMessages, true);
            
            // Confirmation message with the number of messages deleted
            await interaction.editReply({
                content: `<:K3_approved:1400814077596663808> Deleted **${deleted.size}** messages.`,
            });

        } catch (error) {
            console.error('Error while deleting messages:', error);
            await interaction.editReply({
                content: '❌ Error deleting messages. Make sure the bot has the necessary permissions and messages are not older than 14 days.',
            });
        }
    }
};