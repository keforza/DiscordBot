// commands/youtube.js
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: {
        name: 'youtube',
        description: 'Searches for a YouTube channel.', // English
        options: [
            {
                name: 'search',
                description: 'Type the name of the YouTube channel to search for.', // English
                type: 3, // STRING
                required: true
            }
        ]
    },
    async execute(interaction) {
        await interaction.deferReply(); 

        const search = interaction.options.getString('search');
        try {
            const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(search)}&key=${process.env.YOUTUBE_API_KEY}`);
            const ytData = await ytRes.json();

            if (!ytData.items?.length) {
                return interaction.editReply({ content: '❌ YouTube channel not found.', ephemeral: true }); // English
            }

            const channel = ytData.items[0];
            const channelId = channel.snippet.channelId;

            const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${process.env.YOUTUBE_API_KEY}`);
            const ch = (await channelRes.json()).items[0];

            // Format numbers for better readability (e.g., 1,234,567)
            const subscriberCount = Number(ch.statistics.subscriberCount).toLocaleString('en-US');
            const videoCount = Number(ch.statistics.videoCount).toLocaleString('en-US');
            const viewCount = Number(ch.statistics.viewCount).toLocaleString('en-US');

            // Format creation date for footer
            const createdAt = new Date(ch.snippet.publishedAt).toLocaleString('en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const embed = new EmbedBuilder()
                .setColor('#FF0000') // YouTube Red
                .setTitle(ch.snippet.title)
                .setURL(`https://www.youtube.com/channel/${channelId}`) // Corrected YouTube channel link using channelId
                .setThumbnail(ch.snippet.thumbnails.high.url)
                .setDescription(ch.snippet.description || 'No description available.') // English
                .addFields(
                    // Rimossa la scritta "Video Stats" e tolti i riquadri neri
                    { 
                        name: 'Videos uploaded', // English, as per the image
                        value: `${videoCount}`,
                        inline: true // Mettiamo inline: true per i valori affiancati
                    },
                    { 
                        name: 'Views', // English, as per the image
                        value: `${viewCount}`,
                        inline: true // Mettiamo inline: true per i valori affiancati
                    },
                    { 
                        name: 'Subscribers', // English, as per the image
                        value: `${subscriberCount}`,
                        inline: true // Mettiamo inline: true per i valori affiancati
                    }
                    // La data 'Created' viene spostata nel footer
                )
                .setFooter({ text: `Created • ${createdAt}` }); // 'Created' moved to footer, as per image

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error('❌ YouTube API Error:', err.message); // English
            await interaction.editReply({ content: `🚫 YouTube Error: ${err.message}`, ephemeral: true }); // English
        }
    }
};