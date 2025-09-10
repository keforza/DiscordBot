const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('infoserver')
        .setDescription('Shows detailed information about this Discord server.')
        // Makes the command usable only by those with the Kick Members permission
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
        // Prevents the command from being used in direct messages (DMs)
        .setDMPermission(false),

    async execute(interaction) {
        // Defer the reply, making it publicly visible from the start
        // The "ephemeral: false" option is now deprecated and is the default behavior, so it can be removed.
        await interaction.deferReply();

        const guild = interaction.guild; // Get the Guild object (server)
        if (!guild) {
            // This specific error should be ephemeral if a user tries to use it in a DM
            // The deferReply from above would have failed, so we can use a direct reply
            return await interaction.reply({
                content: '<:K3_wrong:1407992234145611867> This command can only be used inside a server.',
                ephemeral: true
            });
        }

        // --- Gathering and formatting information ---

        // Fetch the owner's user object to get their username
        const ownerUser = await interaction.client.users.fetch(guild.ownerId);

        // Member count (including bots) is always accurate from the API
        const totalMembers = guild.memberCount;

        // Fetch all members to get an accurate bot count.
        // This requires the GUILD_MEMBERS intent to be enabled for your bot.
        const members = await guild.members.fetch();

        // Count bots from the fetched members
        const botMembers = members.filter(member => member.user.bot).size;

        // Calculate human members by subtracting bots from the total
        const humanMembers = totalMembers - botMembers;

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
                    value: `\`${ownerUser.username}\``,
                    inline: false
                },
                {
                    name: '👥 Member Statistics',
                    value: `\`\`\`
Total: ${totalMembers}
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

        await interaction.editReply({ embeds: [embed] });
    },
};