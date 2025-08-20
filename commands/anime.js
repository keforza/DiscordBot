const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const deepl = require('deepl-node');

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
                    genres
                    averageScore
                    description(asHtml: false)
                    trailer {
                        id
                        site
                    }
                    startDate {
                        year
                        month
                        day
                    }
                    endDate {
                        year
                        month
                        day
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

            let synopsis = anime.description || 'No synopsis available.';
            synopsis = synopsis.replace(/<br>/g, '\n').replace(/<i>|<\/i>/g, '').trim();

            if (synopsis.length > 1000) {
                synopsis = synopsis.substring(0, 997) + '...';
            }
            if (synopsis.length === 0) {
                synopsis = 'No synopsis available.';
            }

            // --- Synopsis Translation to Italian ---
            if (process.env.DEEPL_AUTH_KEY) {
                const translator = new deepl.Translator(process.env.DEEPL_AUTH_KEY);
                try {
                    const translation = await translator.translateText(synopsis, null, 'it');
                    synopsis = translation.text;
                } catch (translationError) {
                    console.error('Error translating synopsis:', translationError);
                }
            } else {
                console.warn('DeepL API key not found. Synopsis will not be translated.');
            }

            const genres = anime.genres && anime.genres.length > 0
                ? anime.genres.join(', ')
                : 'N/A';

            const score = anime.averageScore ? `${anime.averageScore} / 100` : 'N/A';

            let trailerUrl = 'N/A';
            if (anime.trailer && anime.trailer.site === 'youtube') {
                trailerUrl = `https://www.youtube.com/watch?v=${anime.trailer.id}`;
            }

            const startDate = anime.startDate.year ? `${anime.startDate.month || ''}/${anime.startDate.day || ''}/${anime.startDate.year}`.replace(/^\/+|\/+$/g, '').replace(/\/\/+/g, '/') : 'N/A';
            const endDate = anime.endDate.year ? `${anime.endDate.month || ''}/${anime.endDate.day || ''}/${anime.endDate.year}`.replace(/^\/+|\/+$/g, '').replace(/\/\/+/g, '/') : 'N/A';
            const airedDate = (startDate === 'N/A' && endDate === 'N/A') ? 'N/A' : `${startDate} - ${endDate}`;

            // --- Status Formatting (Title Case) ---
            let status = anime.status || 'N/A';
            if (status !== 'N/A') {
                status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
            }

            const embed = new EmbedBuilder()
                .setColor('#FF99CC')
                .setTitle(anime.title.english || anime.title.romaji || anime.title.native)
                .setURL(anime.siteUrl)
                .setDescription(`*Alternative Titles: ${anime.title.native || 'N/A'}*`)
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