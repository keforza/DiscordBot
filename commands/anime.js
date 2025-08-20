const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios'); // Importa la libreria Axios

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

        // La query GraphQL che specifica i dati che vogliamo
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
                    season
                    seasonYear
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

            // --- Estrazione e pulizia dei dati dall'API di AniList ---
            let synopsis = anime.description || 'No synopsis available.';
            // Rimuove eventuali tag HTML che AniList a volte include
            synopsis = synopsis.replace(/<br>/g, '\n').replace(/<i>|<\/i>/g, '').trim();

            if (synopsis.length > 1000) {
                synopsis = synopsis.substring(0, 997) + '...';
            }
            if (synopsis.length === 0) {
                synopsis = 'No synopsis available.';
            }

            // I generi sono già un array, li uniamo
            const genres = anime.genres && anime.genres.length > 0
                ? anime.genres.join(', ')
                : 'N/A';

            // Il punteggio è su una scala da 1 a 100
            const score = anime.averageScore ? `${anime.averageScore} / 100` : 'N/A';

            // Costruiamo il link al trailer se esiste
            let trailerUrl = 'N/A';
            if (anime.trailer && anime.trailer.site === 'youtube') {
                trailerUrl = `https://www.youtube.com/watch?v=${anime.trailer.id}`;
            }

            const embed = new EmbedBuilder()
                .setColor('#FF99CC')
                .setTitle(anime.title.english || anime.title.romaji || anime.title.native)
                .setURL(anime.siteUrl)
                .setDescription(`*Titoli alternativi: ${anime.title.native || 'N/A'}*`)
                .setThumbnail(anime.coverImage.large || null)
                .addFields(
                    { name: '📝 Synopsis', value: synopsis, inline: false },
                    { name: '<:K3_episodes:1400824494540460043> Episodes', value: anime.episodes ? String(anime.episodes) : 'N/A', inline: true },
                    { name: '<:K3_approved:1400814077596663808> Status', value: anime.status || 'N/A', inline: true },
                    { name: '<:K3_onair:1291676245259456552> Aired', value: anime.season && anime.seasonYear ? `${anime.season} ${anime.seasonYear}` : 'N/A', inline: true },
                    { name: '<:K3_star:1289918161294065724> Score', value: score, inline: true },
                    { name: '🏷️ Genres', value: genres, inline: true },
                    { name: '🏢 Studio(s)', value: 'N/A', inline: true }, // AniList non fornisce lo studio direttamente in questa query
                    { name: '🔞 Rating', value: 'N/A', inline: true } // AniList non fornisce un campo "Rating"
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