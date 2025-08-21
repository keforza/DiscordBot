const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('infoserver')
        .setDescription('Shows detailed information about this Discord server.')
        // Rende il comando utilizzabile solo da chi ha il permesso di espellere membri (moderatori)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
        // Impedisce l'utilizzo del comando nei messaggi diretti (DM)
        .setDMPermission(false),

    async execute(interaction) {
        // Differisce la risposta, rendendola pubblica fin da subito
        await interaction.deferReply({ ephemeral: false });

        const guild = interaction.guild; // Get the Guild object (server)
        if (!guild) {
            return await interaction.editReply({
                content: '<:K3_wrong:1407992234145611867> This command can only be used inside a server.',
                ephemeral: true // Questo errore specifico rimane effimero per l'utente che ha sbagliato ad usarlo
            });
        }

        // --- Gathering and formatting information ---

        // Fetch the owner's user object to get their username
        const ownerUser = await interaction.client.users.fetch(guild.ownerId);
        
        // Member count (including bots)
        const memberCount = guild.memberCount;
        // Human members (excluding bots)
        const humanMembers = guild.members.cache.filter(member => !member.user.bot).size;
        // Bot members
        const botMembers = guild.members.cache.filter(member => member.user.bot).size;

        // Channel count
        const textChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size;
        const voiceChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size;
        const categoryChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildCategory).size;
        const totalChannels = guild.channels.cache.size;

        // Boost level
        const boostLevel = guild.premiumTier; // 0, 1, 2, 3
        const boostCount = guild.premiumSubscriptionCount || 0;

        // Server creation date formatted
        const dateOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        const creationDateFormatted = guild.createdAt.toLocaleDateString('en-US', dateOptions);

        // --- Building the Embed with copiable black fields ---
        const embed = new EmbedBuilder()
            .setColor('#2B2D31') // Dark grey color, similar to your userinfo example
            .setTitle(`<:K3_server:1407995896527982673> Server Information`) // Title without the server name here
            .setThumbnail(guild.iconURL({ dynamic: true, size: 256 })) // Server icon
            .setImage(guild.bannerURL({ dynamic: true, size: 512 })) // Server banner (if present)
            .addFields(
                {
                    name: '🌐 Server Name',
                    value: `\`\`\`${guild.name}\`\`\``,
                    inline: false
                },
                {
                    name: '<:K3_id:1407994227333533716> Server ID',
                    value: `\`\`\`${guild.id}\`\`\``,
                    inline: false
                },
                {
                    name: '<:K3_crown:1289915588856119359> Owner',
                    value: `\`${ownerUser.username}\``, // Ora singola riga copiabile
                    inline: false
                },
                {
                    name: '👥 Member Statistics',
                    value: `\`\`\`
Total: ${memberCount}
Humans: ${humanMembers}
Bots: ${botMembers}
\`\`\``,
                    inline: true
                },
                {
                    name: '💬 Channel Statistics',
                    value: `\`\`\`
Total: ${totalChannels}
Text: ${textChannels}
Voice: ${voiceChannels}
Categories: ${categoryChannels}
\`\`\``,
                    inline: true
                },
                {
                    name: '<:K3_boost:1403369335657070766> Server Boost Info',
                    value: `\`\`\`
Level: ${boostLevel}
Boosts: ${boostCount}
\`\`\``,
                    inline: false
                },
                {
                    name: '🗓️ Creation Date',
                    value: `\`\`\`${creationDateFormatted}\`\`\``,
                    inline: true
                },
                {
                    name: '🌍 Region & Verification',
                    value: `\`\`\`
Region: ${guild.preferredLocale || 'N/A'}
Verification Level: ${guild.verificationLevel}
\`\`\``,
                    inline: true
                }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp(); // Adds the current timestamp

        // The reply is already public due to deferReply({ ephemeral: false })
        await interaction.editReply({ embeds: [embed] });
    },
};