// commands/mute.js
const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { parseDuration } = require('../utils/durationParser');
const { ensureMuteRole } = require('../utils/roleManager');

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
            option.setName('reason')
                .setDescription('Reason for the mute')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Duration of the mute (e.g., 10m, 1h, 1d) or "permanent"')
                .setRequired(false) // Opzione non obbligatoria
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers)
        .setDMPermission(false),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getMember('user');
        const durationStr = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason specified';

        if (!user) return interaction.editReply({ content: '<:K3_wrong:1407992234145611867> User not found in the server.' });
        if (user.id === interaction.user.id) return interaction.editReply({ content: '<:K3_wrong:1407992234145611867> You cannot mute yourself.' });
        if (!user.moderatable) return interaction.editReply({ content: '<:K3_wrong:1407992234145611867> I cannot mute this user. Their role is too high or I am missing permissions.' });

        // --- GESTIONE DELLA DURATA ---
        const isPermanent = !durationStr || durationStr.toLowerCase() === 'permanent';
        let durationMs;

        if (!isPermanent) {
            durationMs = parseDuration(durationStr);
            if (!durationMs) {
                return interaction.editReply({ content: '<:K3_wrong:1407992234145611867> Invalid duration format. Use e.g., `10m`, `1h`, `1d` or "permanent".' });
            }
        }
        // --- FINE GESTIONE ---

        const muteRole = await ensureMuteRole(interaction.guild);
        if (!muteRole) return interaction.editReply({ content: '<:K3_wrong:1407992234145611867> Internal error creating/retrieving Muted role.' });

        try {
            if (user.roles.cache.has(muteRole.id)) {
                return interaction.editReply({ content: '<:K3_wrong:1407992234145611867> User is already muted.' });
            }

            await user.roles.add(muteRole, `Mute by ${interaction.user.tag} for ${reason}`);

            // Send DM to the muted user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('You have been muted!🔇')
                    .setDescription(`You have been muted on the server **${interaction.guild.name}** by **${interaction.user.tag}**.`)
                    .addFields(
                        { name: 'Reason', value: reason, inline: true }
                    )
                    .setTimestamp();
                
                if (isPermanent) {
                    dmEmbed.addFields({ name: 'Duration', value: 'Permanent', inline: true });
                } else {
                    dmEmbed.addFields(
                        { name: 'Duration', value: durationStr, inline: true },
                        { name: 'Mute Ends', value: `<t:${Math.floor((Date.now() + durationMs) / 1000)}:R>`, inline: false }
                    );
                }
                
                await user.send({ embeds: [dmEmbed] }).catch(() => {});
            } catch (dmError) {
                console.error(`Could not send DM to ${user.user.tag}:`, dmError.message);
            }

            // Public confirmation message
            const confirmationMessage = isPermanent ?
                `🔇 **${user.user.tag}** has been muted **permanently**. Reason: **${reason}**` :
                `🔇 **${user.user.tag}** has been muted for **${durationStr}**. Reason: **${reason}**`;

            await interaction.editReply({
                content: confirmationMessage,
                ephemeral: false
            });

            // Set timeout only for temporary mutes
            if (!isPermanent) {
                setTimeout(async () => {
                    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
                    if (member && member.roles.cache.has(muteRole.id)) {
                        try {
                            await member.roles.remove(muteRole, 'Automatic mute ended');
                            const unmuteDmEmbed = new EmbedBuilder()
                                .setColor('#00FF00')
                                .setTitle('You got unmuted 🔊')
                                .addFields(
                                    { name: 'Reason', value: `\`Expired\``, inline: false },
                                    { name: 'Responsible', value: `\`${interaction.client.user.tag}\``, inline: true }
                                )
                                .setTimestamp();
                            await member.send({ embeds: [unmuteDmEmbed] }).catch(() => {});
                        } catch (unmuteError) {
                            console.error('Error removing automatic mute:', unmuteError);
                        }
                    }
                }, durationMs);
            }
        } catch (error) {
            console.error('Error muting user:', error);
            await interaction.editReply({ content: '<:K3_wrong:1407992234145611867> An error occurred while muting the user.' });
        }
    }
};