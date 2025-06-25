// commands/youtube.js
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: {
        name: 'youtube',
        description: 'Cerca uno youTuber',
        options: [
            {
                name: 'search',
                description: 'Digita il nome dello/della youtuber da cercare',
                type: 3, // STRING
                required: true
            }
        ]
    },
    async execute(interaction, ephemeralReply) {
        const search = interaction.options.getString('search');
        try {
            const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(search)}&key=${process.env.YOUTUBE_API_KEY}`);
            const ytData = await ytRes.json();

            if (!ytData.items?.length) return interaction.reply(ephemeralReply('❌ Canale YouTube non trovato.'));

            const channel = ytData.items[0];
            const channelId = channel.snippet.channelId;

            const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${process.env.YOUTUBE_API_KEY}`);
            const ch = (await channelRes.json()).items[0];

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle(ch.snippet.title)
                .setThumbnail(ch.snippet.thumbnails.high.url)
                .setDescription(ch.snippet.description || 'Nessuna descrizione disponibile.')
                .addFields(
                    { name: '📅 Creato il', value: new Date(ch.snippet.publishedAt).toLocaleDateString('it-IT'), inline: true },
                    { name: '👥 Iscritti', value: Number(ch.statistics.subscriberCount).toLocaleString('it-IT'), inline: true },
                    { name: '📺 Video totali', value: Number(ch.statistics.videoCount).toLocaleString('it-IT'), inline: true },
                    { name: 'Profilo YouTube', value: `[${ch.snippet.title}](https://www.youtube.com/channel/${channelId})` } // Correzione del link
                );

            await interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error('❌ Errore YouTube API:', err.message);
            await interaction.reply(ephemeralReply(`🚫 Errore YouTube: ${err.message}`));
        }
    }
};