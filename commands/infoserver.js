const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('infoserver')
        .setDescription('Mostra informazioni dettagliate su questo server Discord.'),

    async execute(interaction) {
        // Differisce la risposta per dare tempo al bot di raccogliere le informazioni.
        await interaction.deferReply({ ephemeral: true });

        const guild = interaction.guild; // Ottiene l'oggetto Guild (server)
        if (!guild) {
            return await interaction.editReply({
                content: '❌ Questo comando può essere usato solo all\'interno di un server.',
                ephemeral: true
            });
        }

        // --- Raccolta e formattazione delle informazioni ---

        // Conteggio membri e bot
        const memberCount = guild.memberCount;
        const humanMembers = guild.members.cache.filter(member => !member.user.bot).size;
        const botMembers = guild.members.cache.filter(member => member.user.bot).size;
        
        // Conteggio canali
        const textChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size;
        const voiceChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size;
        const categoryChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildCategory).size;
        const totalChannels = guild.channels.cache.size;

        // Livello di boost
        const boostLevel = guild.premiumTier;
        const boostCount = guild.premiumSubscriptionCount || 0;

        // Data di creazione del server formattata
        const dateOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        const creationDateFormatted = guild.createdAt.toLocaleDateString('it-IT', dateOptions);

        // --- Costruzione dell'Embed con campi neri copiabili ---
        const embed = new EmbedBuilder()
            .setColor('#2B2D31') // Colore nero, come nel tuo esempio userinfo
            .setTitle(`📊 Informazioni sul Server: ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 256 })) // Icona del server
            .setImage(guild.bannerURL({ dynamic: true, size: 512 })) // Banner del server (se presente)
            .addFields(
                {
                    name: '🆔 ID Server',
                    value: `\`\`\`${guild.id}\`\`\``,
                    inline: false
                },
                {
                    name: '👑 Proprietario',
                    value: `\`\`\`${guild.ownerId}\`\`\``,
                    inline: false
                },
                {
                    name: 'Statistiche Membri',
                    value: `\`\`\`
Totali: ${memberCount}
Umani: ${humanMembers}
Bot: ${botMembers}
\`\`\``,
                    inline: true
                },
                {
                    name: 'Statistiche Canali',
                    value: `\`\`\`
Totali: ${totalChannels}
Testo: ${textChannels}
Vocali: ${voiceChannels}
Categorie: ${categoryChannels}
\`\`\``,
                    inline: true
                },
                {
                    name: 'Info Creazione & Boost',
                    value: `\`\`\`
Creato il: ${creationDateFormatted}
Livello Boost: ${boostLevel} (${boostCount} boosts)
\`\`\``,
                    inline: false
                },
                {
                    name: 'Altre Info',
                    value: `\`\`\`
Regione: ${guild.preferredLocale || 'N/D'}
Livello Verifica: ${guild.verificationLevel}
\`\`\``,
                    inline: false
                }
            )
            .setFooter({ text: `Richiesto da ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp(); // Aggiunge il timestamp attuale

        // Modifica la risposta deferita, rendendola pubblica
        await interaction.editReply({ embeds: [embed], ephemeral: false });
    },
};