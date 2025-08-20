const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

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

        const query = `
            query ($search: String) {
                Media (search: $search, type: ANIME) {
                    id
                    siteUrl
                    title {
                        romaji
                        english
                        native
                    }
                    coverImage {
                        large
                    }
                    episodes
                    status
                    startDate {
                        year
                        month
                        day
                    }
                    genres
                    averageScore
                    description(asHtml: false)
                    trailer {
                        id
                        site
                    }
                }
            }
        `;

        const variables = {
            search: searchQuery
        };

        try {
            const response = await axios.post('https://graphql.anilist.co', {
                query: query,
                variables: variables
            });

            const anime = response.data.data.Media;

            if (!anime) {
                return interaction.editReply({
                    content: `❌ Anime "${searchQuery}" not found. Try a different or more specific name.`,
                    ephemeral: true
                });
            }

            // --- Synopsis Management ---
            let synopsis = anime.description || 'No synopsis available.';
            synopsis = synopsis.replace(/<br>/g, '\n').replace(/<i>|<\/i>/g, '').trim();

            if (synopsis.length > 1000) {
                synopsis = synopsis.substring(0, 997) + '...';
            }
            if (synopsis.length === 0) {
                synopsis = 'No synopsis available.';
            }

            // --- Genres Management ---
            const genres = anime.genres && anime.genres.length > 0
                ? anime.genres.join(', ')
                : 'N/A';

            // --- Score Management ---
            const score = anime.averageScore ? `${anime.averageScore} / 100` : 'N/A';

            // --- Trailer Management ---
            let trailerUrl = 'N/A';
            if (anime.trailer && anime.trailer.site === 'youtube') {
                trailerUrl = `https://www.youtube.com/watch?v=${anime.trailer.id}`;
            }

            // --- Status Formatting (English) ---
            let status = anime.status || 'N/A';
            if (status !== 'N/A') {
                status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
            }
            
            // --- Date Formatting ---
            let airedDate = 'N/A';
            if (anime.startDate && anime.startDate.year) {
                const monthNames = [
                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                ];
                const month = monthNames[anime.startDate.month - 1] || '';
                const day = anime.startDate.day || '';
                const year = anime.startDate.year || '';
                
                // Construct the date string, handling potential missing day or month
                const dateParts = [];
                if (month) dateParts.push(month);
                if (day) dateParts.push(day);
                if (dateParts.length > 1) dateParts[dateParts.length - 1] += ','; // Add comma after day
                if (year) dateParts.push(year);
                
                airedDate = dateParts.join(' ');
            }

            const embed = new EmbedBuilder()
                .setColor('#FF99CC')
                .setTitle(anime.title.english || anime.title.romaji || anime.title.native)
                .setURL(anime.siteUrl)
                .setThumbnail(anime.coverImage.large || null)
                .addFields(
                    { name: '📝 Synopsis', value: synopsis, inline: false },
                    { name: '<:K3_episodes:1400824494540460043> Episodes', value: anime.episodes ? String(anime.episodes) : 'N/A', inline: true },
                    { name: '<:K3_approved:1400814077596663808> Status', value: status, inline: true },
                    { name: '<:K3_onair:1291676245259456552> Aired', value: airedDate, inline: true },
                    { name: '<:K3_star:1289918161294065724> Score', value: score, inline: true },
                    { name: '🏷️ Genres', value: genres, inline: true },
                    { name: '🏢 Studio(s)', value: 'N/A', inline: true },
                    { name: '🔞 Rating', value: 'N/A', inline: true }
                );
            
            if (trailerUrl !== 'N/A') {
                embed.addFields({ name: '📺 Trailer', value: `[Watch Trailer](${trailerUrl})`, inline: false });
            }
            
            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error fetching anime data from AniList:', error);
            await interaction.editReply({
                content: `❌ An unexpected error occurred while fetching anime data from AniList.`,
                ephemeral: true
            });
        }
    },
};