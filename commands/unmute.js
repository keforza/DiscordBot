// commands/unmute.js
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { ensureMuteRole } = require('../utils/roleManager'); // Importa la funzione helper

module.exports = {
    data: {
        name: 'unmute',
        description: 'Togli il mute a un utente',
        default_member_permissions: PermissionsBitField.Flags.ModerateMembers.toString(),
        dm_permission: false,
        options: [
            {
                name: 'user',
                description: 'Utente da smutare',
                type: 6, // USER
                required: true
            }
        ]
    },
    async execute(interaction, ephemeralReply) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply(ephemeralReply('🚫 Non hai il permesso di smutare membri.'));
        }

        const user = interaction.options.getMember('user');
        if (!user) return interaction.reply(ephemeralReply('❌ Utente non trovato nel server.'));

        const muteRole = await ensureMuteRole(interaction.guild); // Usa la funzione helper
        if (!muteRole) return interaction.reply(ephemeralReply('❌ Ruolo Muted non trovato o creato.'));

        if (!user.roles.cache.has(muteRole.id)) {
            return interaction.reply(ephemeralReply('❌ Utente non è mutato.'));
        }

        try {
            await user.roles.remove(muteRole, `Unmute da ${interaction.user.tag}`);
            await interaction.reply(ephemeralReply(`🔈 ${user.user.tag} è stato smutato.`));

            try {
                const unmuteDmEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('Sei stato smutato!')
                    .setDescription(`Sei stato smutato manualmente sul server **${interaction.guild.name}** da **${interaction.user.tag}**. Ora puoi tornare a interagire.`);
                await user.send({ embeds: [unmuteDmEmbed] });
            } catch (dmError) {
                console.error(`❌ Impossibile inviare DM di unmute a ${user.user.tag}:`, dmError.message);
            }
        } catch (error) {
            console.error('Errore rimuovendo mute:', error);
            interaction.reply(ephemeralReply('❌ Errore rimuovendo il mute.'));
        }
    }
};