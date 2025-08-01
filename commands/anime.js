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

            if (!response.ok || !data || !data.data || data.data.length === 0) {
                // Migliore gestione degli errori HTTP e dati non trovati
                const errorMessage = data && data.message ? data.message : `Anime "${searchQuery}" not found. Try a different or more specific name.`;
                return interaction.editReply({
                    content: `❌ ${errorMessage}`,
                    ephemeral: true
                });
            }

            const anime = data.data[0];

            // --- Gestione della Sinossi ---
            let synopsis = anime.synopsis || 'No synopsis available.';
            // Rimuovi "[Written by MAL Rewrite]" e simili
            synopsis = synopsis.replace(/\[Written by MAL Rewrite\]/gi, '').trim();
            synopsis = synopsis.replace(/\[Source:.*?\]/gi, '').trim(); // Rimuove anche altri riferimenti di fonte

            // Trunca la sinossi se troppo lunga
            if (synopsis.length > 1000) { // Un po' meno di 1024 per avere margine
                synopsis = synopsis.substring(0, 997) + '...';
            }
            if (synopsis.length === 0) { // Se dopo la pulizia è vuota
                synopsis = 'No synopsis available.';
            }

            // --- Gestione Generi ---
            const genres = anime.genres && anime.genres.length > 0
                ? anime.genres.map(g => g.name).join(', ')
                : 'N/A';

            // --- Gestione Studi ---
            const studios = anime.studios && anime.studios.length > 0
                ? anime.studios.map(s => s.name).join(', ')
                : 'N/A';

            // --- Gestione Rating ---
            const rating = anime.rating || 'N/A';

            // --- Gestione Trailer ---
            const trailerUrl = anime.trailer && anime.trailer.url ? anime.trailer.url : 'N/A';


            const embed = new EmbedBuilder()
                .setColor('#FF99CC') // Colore rosa/viola più vivace
                .setTitle(anime.title)
                .setURL(anime.url) // Link alla pagina MAL dell'anime
                .setDescription(`*Alternative Titles: ${anime.title_japanese || 'N/A'}*`) // Titolo giapponese o altri titoli
                .setThumbnail(anime.images.jpg.image_url || null) // UTILIZZA image_url per una thumbnail leggermente più grande
                // RIMOSSO: .setImage(anime.images.jpg.large_image_url || anime.images.jpg.image_url || null)
                .addFields(
                    { name: '📝 Synopsis', value: synopsis, inline: false },
                    { name: '🎬 Episodes', value: anime.episodes ? String(anime.episodes) : 'N/A', inline: true },
                    { name: '✅ Status', value: anime.status || 'N/A', inline: true },
                    { name: '📅 Aired', value: anime.aired.string || 'N/A', inline: true },
                    { name: '⭐ Score', value: anime.score ? `${anime.score} / 10` : 'N/A', inline: true }, // Aggiunto "/ 10"
                    { name: '🏷️ Genres', value: genres, inline: true },
                    { name: '🏢 Studio(s)', value: studios, inline: true }, // Nuovo campo: Studio
                    { name: '🔞 Rating', value: rating, inline: true } // Nuovo campo: Rating
                )
                // Aggiunta campo per il trailer, ma solo se c'è un URL valido
                if (trailerUrl !== 'N/A') {
                    embed.addFields(
                        { name: '📺 Trailer', value: `[Watch Trailer](${trailerUrl})`, inline: false }
                    );
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