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
    // Removed 'ephemeralReply' as a parameter
    async execute(interaction) {
        // Defer the reply to give time for API calls, making it visible to everyone by default
        await interaction.deferReply(); 

        const search = interaction.options.getString('search');
        try {
            const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(search)}&key=${process.env.YOUTUBE_API_KEY}`);
            const ytData = await ytRes.json();

            if (!ytData.items?.length) {
                // Use editReply since we already deferred
                return interaction.editReply({ content: '❌ YouTube channel not found.', ephemeral: true }); // English
            }

            const channel = ytData.items[0];
            const channelId = channel.snippet.channelId;

            const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${process.env.YOUTUBE_API_KEY}`);
            const ch = (await channelRes.json()).items[0];

            // Format numbers for better readability (e.g., 1,234,567)
            const subscriberCount = Number(ch.statistics.subscriberCount).toLocaleString('en-US');
            const videoCount = Number(ch.statistics.videoCount).toLocaleString('en-US');
            const viewCount = Number(ch.statistics.viewCount).toLocaleString('en-US'); // Assuming total views are available in statistics

            // Format creation date
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
                .setURL(`https://www.youtube.com/channel/${channelId}`) // Corrected YouTube channel link
                .setThumbnail(ch.snippet.thumbnails.high.url)
                .setDescription(ch.snippet.description || 'No description available.') // English
                .addFields(
                    { 
                        name: 'Video Stats', // A single field to group stats like the image
                        value: `**Videos uploaded:** \`${videoCount}\`\n**Views:** \`${viewCount}\`\n**Subscribers:** \`${subscriberCount}\``,
                        inline: false 
                    },
                    { 
                        name: 'Created', // English
                        value: `\`${createdAt}\``, 
                        inline: false 
                    }
                );

            await interaction.editReply({ embeds: [embed] }); // Use editReply since we deferred

        } catch (err) {
            console.error('❌ YouTube API Error:', err.message); // English
            // Use editReply since we deferred
            await interaction.editReply({ content: `🚫 YouTube Error: ${err.message}`, ephemeral: true }); // English
        }
    }
};