const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'delete',
        description: 'Deletes a number of messages (moderators only)',
        default_member_permissions: PermissionsBitField.Flags.ManageMessages.toString(),
        dm_permission: false,
        options: [
            {
                name: 'count',
                description: 'Number of messages to delete (max 100)',
                type: 4,
                required: true
            }
        ]
    },
    async execute(interaction, ephemeralReply) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply(ephemeralReply('🚫 Only moderators can use this command.'));
        }

        const count = interaction.options.getInteger('count');
        if (count < 1 || count > 100) {
            return interaction.reply(ephemeralReply('❌ You can delete between 1 and 100 messages at a time.'));
        }

        const messages = await interaction.channel.messages.fetch({ limit: count + 1 });
        const deletableMessages = messages.filter(msg => msg.deletable);

        if (deletableMessages.size === 0) {
            return interaction.reply(ephemeralReply('No recent deletable messages found in the specified amount.'));
        }

        try {
            await interaction.channel.bulkDelete(deletableMessages, true);
            await interaction.reply(ephemeralReply(`✅ Deleted ${deletableMessages.size - 1} messages.`));

        } catch (error) {
            console.error(error);
            await interaction.reply(ephemeralReply('❌ Error deleting messages. Make sure the bot has the necessary permissions and messages are not too old (Discord does not allow bulk deletion of messages older than 14 days).'));
        }
    }
};