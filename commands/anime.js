const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anime')
        .setDescription('Searches for information about a specific anime.')
        .addStringOption(option =>
            option.setName('search')
                .setDescription('The name of the anime to search for.')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        await interaction.deferReply();

        const searchQuery = interaction.options.getString('search');

        try {
            const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchQuery)}&limit=1`);
            const data = await response.json();

            if (!data || !data.data || data.data.length === 0) {
                return interaction.editReply({ 
                    content: `❌ Anime "${searchQuery}" not found. Try a different or more specific name.`, 
                    ephemeral: true 
                });
            }

            const anime = data.data[0];

            let synopsis = anime.synopsis || 'No synopsis available.';
            
            if (synopsis.includes('[Written by MAL Rewrite]')) {
                synopsis = synopsis.replace('[Written by MAL Rewrite]', '').trim();
            }

            if (synopsis.length > 1024) {
                synopsis = synopsis.substring(0, 1021) + '...';
            }

            const embed = new EmbedBuilder()
                .setColor('#2E588F')
                .setTitle(anime.title)
                .setURL(anime.url)
                .setThumbnail(anime.images.jpg.image_url || null)
                .addFields(
                    { name: 'Synopsis', value: synopsis, inline: false },
                    { name: 'Episodes', value: anime.episodes ? String(anime.episodes) : 'N/A', inline: true },
                    { name: 'Status', value: anime.status || 'N/A', inline: true },
                    { name: 'Aired From', value: anime.aired.string || 'N/A', inline: true },
                    { name: 'Score', value: anime.score ? String(anime.score) : 'N/A', inline: true },
                    { name: 'Genres', value: anime.genres.map(g => g.name).join(', ') || 'N/A', inline: true }
                );

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ 
                content: `❌ An error occurred while fetching anime data. Please try again later.`, 
                ephemeral: true 
            });
        }
    },
};