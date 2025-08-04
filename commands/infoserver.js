const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('infoserver')
        .setDescription('Mostra informazioni dettagliate su questo server Discord.'),

    async execute(interaction) {
        // Differisce la risposta come effimera inizialmente, poi la renderemo pubblica con l'embed.
        await interaction.deferReply({ ephemeral: true });

        const guild = interaction.guild; // Ottiene l'oggetto Guild (server)
        if (!guild) {
            return await interaction.editReply({
                content: '❌ Questo comando può essere usato solo all\'interno di un server.',
                ephemeral: true
            });
        }

        // --- Raccolta delle informazioni ---

        // Conteggio membri (bot inclusi)
        const memberCount = guild.memberCount;
        // Conteggio membri umani (escludendo i bot)
        const humanMembers = guild.members.cache.filter(member => !member.user.bot).size;
        // Conteggio bot
        const botMembers = guild.members.cache.filter(member => member.user.bot).size;

        // Conteggio canali
        const textChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size;
        const voiceChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size;
        const categoryChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildCategory).size;
        const totalChannels = guild.channels.cache.size;

        // Livello di boost
        const boostLevel = guild.premiumTier; // 0, 1, 2, 3
        const boostCount = guild.premiumSubscriptionCount || 0;

        // Data di creazione del server
        const creationDate = guild.createdAt.toLocaleDateString('it-IT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const creationTime = guild.createdAt.toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // --- Costruzione dell'Embed ---
        const embed = new EmbedBuilder()
            .setColor('#5865F2') // Un bel blu Discord
            .setTitle(`📊 Informazioni sul Server: ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 256 })) // Icona del server
            .setImage(guild.bannerURL({ dynamic: true, size: 512 })) // Banner del server (se presente)
            .addFields(
                {
                    name: '🆔 ID Server',
                    value: `\`${guild.id}\``, // Formattato come blocco di codice copiabile
                    inline: false // Campo a riga intera
                },
                {
                    name: '👑 Proprietario',
                    value: `<@${guild.ownerId}> (\`${guild.ownerId}\`)`, // Menziona il proprietario e mostra l'ID copiabile
                    inline: false
                },
                {
                    name: '🗓️ Creato il',
                    value: `${creationDate} alle ${creationTime}`,
                    inline: true
                },
                {
                    name: '👥 Membri',
                    value: `Totali: \`${memberCount}\`\nUmani: \`${humanMembers}\`\nBot: \`${botMembers}\``,
                    inline: true
                },
                {
                    name: '💬 Canali',
                    value: `Testo: \`${textChannels}\`\nVocali: \`${voiceChannels}\`\nCategorie: \`${categoryChannels}\`\nTotali: \`${totalChannels}\``,
                    inline: true
                },
                {
                    name: '✨ Livello Boost',
                    value: `Livello \`${boostLevel}\` (${boostCount} Boosts)`,
                    inline: true
                },
                {
                    name: '🌍 Regione',
                    value: `\`${guild.preferredLocale || 'N/D'}\``, // Lingua preferita del server
                    inline: true
                },
                {
                    name: '🔒 Livello di Verifica',
                    value: `\`${guild.verificationLevel}\``, // Nessuno, Basso, Medio, Alto, Massima
                    inline: true
                }
            )
            .setFooter({ text: `Richiesto da ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp(); // Aggiunge il timestamp attuale

        // Modifica la risposta deferita, rendendola pubblica
        await interaction.editReply({ embeds: [embed], ephemeral: false });
    },
};