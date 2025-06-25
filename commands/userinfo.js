// commands/userinfo.js
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'userinfo',
        description: 'Mostra informazioni su un utente',
        default_member_permissions: PermissionsBitField.Flags.ManageMessages.toString(),
        dm_permission: true,
        options: [
            {
                name: 'user',
                description: 'Digita un utente da analizzare',
                type: 6, // USER
                required: true
            }
        ]
    },
    async execute(interaction, ephemeralReply) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply(ephemeralReply('🚫 Solo i moderatori possono usare questo comando.'));
        }

        const user = interaction.options.getUser('user') || interaction.user;

        const embed = new EmbedBuilder()
            .setColor('#00AAFF')
            .setTitle(`Info Utente: ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'ID', value: user.id, inline: true },
                { name: 'Bot', value: user.bot ? 'Sì' : 'No', inline: true },
                { name: 'Creato il', value: user.createdAt.toLocaleDateString('it-IT'), inline: true }
            );

        await interaction.reply(ephemeralReply(embed));
    }
};