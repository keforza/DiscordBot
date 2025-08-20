const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anime')
        .setDescription('Searches for information about a specific anime.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Name of the anime to search for.')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const searchQuery = interaction.options.getString('name');

        try {
            const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchQuery)}&limit=1`);
            const data = response.data;

            if (!response.data || !data.data || data.data.length === 0) {
                return interaction.editReply({
                    content: `❌ Anime "${searchQuery}" not found. Try a different or more specific name.`,
                    ephemeral: true
                });
            }

            const anime = data.data[0];

            //Synopsis
            let synopsis = anime.synopsis || 'No synopsis available.';
            synopsis = synopsis.replace(/\[Written by MAL Rewrite\]/gi, '').trim();
            synopsis = synopsis.replace(/\[Source:.*?\]/gi, '').trim();

            if (synopsis.length > 350) {
                synopsis = synopsis.substring(0, 347) + '...';
            }
            if (synopsis.length === 0) {
                synopsis = 'No synopsis available.';
            }

            // --- Genres Management ---
            const genres = anime.genres && anime.genres.length > 0
                ? anime.genres.map(g => g.name).join(', ')
                : 'N/A';

            // --- Studios Management ---
            const studios = anime.studios && anime.studios.length > 0
                ? anime.studios.map(s => s.name).join(', ')
                : 'N/A';

            // --- Rating Management ---
            const rating = anime.rating || 'N/A';

            // --- Trailer Management ---
            const trailerUrl = anime.trailer && anime.trailer.url ? anime.trailer.url : 'N/A';

            const embed = new EmbedBuilder()
                .setColor('#FF99CC')
                .setTitle(anime.title)
                .setURL(anime.url)
                .setThumbnail(anime.images.jpg.image_url || null)
                .addFields(
                    { name: '📝 Synopsis', value: synopsis, inline: false },
                    { name: '<:K3_episodes:1400824494540460043> Episodes', value: anime.episodes ? String(anime.episodes) : 'N/A', inline: true },
                    { name: '<:K3_approved:1400814077596663808> Status', value: anime.status || 'N/A', inline: true },
                    { name: '<:K3_onair:1291676245259456552> Aired', value: anime.aired.string || 'N/A', inline: true },
                    { name: '<:K3_star:1289918161294065724> Score', value: anime.score ? `${anime.score} / 10` : 'N/A', inline: true },
                    { name: '🏷️ Genres', value: genres, inline: true },
                    { name: '🏢 Studio(s)', value: studios, inline: true },
                    { name: '🔞 Age rating', value: rating, inline: true }
                );
            
            if (trailerUrl !== 'NA') {
                embed.addFields({ name: '📺 Trailer', value: `[Watch Trailer](${trailerUrl})`, inline: false });
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error fetching anime data:', error);
            await interaction.editReply({
                content: `❌ An unexpected error occurred while fetching anime data. Please ensure the bot has internet access and the Jikan API is available.`,
                ephemeral: true
            });
        }
    },
};