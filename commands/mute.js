// commands/mute.js
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { parseDuration } = require('../utils/durationParser'); // Importa la funzione helper
const { ensureMuteRole } = require('../utils/roleManager'); // Importa la funzione helper

module.exports = {
    data: {
        name: 'mute',
        description: 'Muta un utente specificando durata e motivo',
        default_member_permissions: PermissionsBitField.Flags.ModerateMembers.toString(),
        dm_permission: false,
        options: [
            {
                name: 'user',
                description: 'Utente da mutare',
                type: 6, // USER
                required: true
            },
            {
                name: 'duration',
                description: 'Durata del mute (es. 10m, 1h, 1d)',
                type: 3, // STRING
                required: true
            },
            {
                name: 'reason',
                description: 'Motivo del mute',
                type: 3, // STRING
                required: false
            }
        ]
    },
    async execute(interaction, ephemeralReply) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply(ephemeralReply('🚫 Non hai il permesso di mutare membri.'));
        }

        const user = interaction.options.getMember('user');
        const durationStr = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'Nessun motivo specificato';

        if (!user) return interaction.reply(ephemeralReply('❌ Utente non trovato nel server.'));
        if (user.id === interaction.user.id) return interaction.reply(ephemeralReply('❌ Non puoi mutare te stesso.'));
        if (!user.moderatable) return interaction.reply(ephemeralReply('❌ Non posso mutare questo utente, ruolo troppo alto o permessi mancanti.'));

        const durationMs = parseDuration(durationStr);
        if (!durationMs) {
            return interaction.reply(ephemeralReply('❌ Formato durata non valido. Usa es. `10m`, `1h`, `1d`.'));
        }

        const muteRole = await ensureMuteRole(interaction.guild);
        if (!muteRole) return interaction.reply(ephemeralReply('❌ Errore interno nel creare/recuperare ruolo Muted.'));

        try {
            if (user.roles.cache.has(muteRole.id)) {
                return interaction.reply(ephemeralReply('❌ Utente già mutato.'));
            }

            await user.roles.add(muteRole, `Mute da ${interaction.user.tag} per ${reason}`);

            const muteEndTime = new Date(Date.now() + durationMs);
            const formattedEndTime = muteEndTime.toLocaleString('it-IT', {
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });

            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Sei stato mutato!')
                    .setDescription(`Sei stato mutato sul server **${interaction.guild.name}** da **${interaction.user.tag}**.`)
                    .addFields(
                        { name: 'Motivo', value: reason, inline: true },
                        { name: 'Durata', value: durationStr, inline: true },
                        { name: 'Fine del mute', value: formattedEndTime }
                    )
                    .setTimestamp();
                await user.send({ embeds: [dmEmbed] });
                await interaction.reply(ephemeralReply(`🔇 ${user.user.tag} è stato mutato per ${durationStr}. Motivo: ${reason}\n✅ L'utente ha ricevuto un DM con i dettagli.`));
            } catch (dmError) {
                console.error(`❌ Impossibile inviare DM a ${user.user.tag}:`, dmError.message);
                await interaction.reply(ephemeralReply(`🔇 ${user.user.tag} è stato mutato per ${durationStr}. Motivo: ${reason}\n⚠️ Impossibile inviare un DM all'utente (potrebbe avere i DM disabilitati).`));
            }

            setTimeout(async () => {
                // Controlla se l'utente è ancora mutato da questo ruolo prima di rimuoverlo
                if (user.roles.cache.has(muteRole.id)) {
                    try {
                        await user.roles.remove(muteRole, 'Mute automatico terminato');
                        try {
                            const unmuteDmEmbed = new EmbedBuilder()
                                .setColor('#00FF00')
                                .setTitle('Il tuo mute è terminato!')
                                .setDescription(`Il tuo mute sul server **${interaction.guild.name}** è terminato automaticamente. Ora puoi tornare a interagire.`);
                            await user.send({ embeds: [unmuteDmEmbed] });
                        } catch (unmuteDmError) {
                            console.error(`❌ Impossibile inviare DM di unmute a ${user.user.tag}:`, unmuteDmError.message);
                        }
                    } catch (e) {
                        console.error('Errore rimuovendo il mute automatico:', e);
                    }
                }
            }, durationMs);

        } catch (error) {
            console.error('Errore mutando utente:', error);
            interaction.reply(ephemeralReply('❌ Errore mutando l\'utente.'));
        }
    }
};