const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const deepl = require('deepl-node'); // 1. Importa la libreria di DeepL

// 2. Inserisci qui la tua API Key di DeepL
// Ti consiglio di usare un file .env per nasconderla, ma per semplicità la mettiamo qui per ora.
const deepLAuthKey = 'TUA_API_KEY_QUI'; // SOSTITUISCI CON LA TUA API KEY

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
                const errorMessage = data && data.message ? data.message : `Anime "${searchQuery}" not found. Try a different or more specific name.`;
                return interaction.editReply({
                    content: `❌ ${errorMessage}`,
                    ephemeral: true
                });
            }

            const anime = data.data[0];

            let synopsis = anime.synopsis || 'No synopsis available.';
            synopsis = synopsis.replace(/\[Written by MAL Rewrite\]/gi, '').trim();
            synopsis = synopsis.replace(/\[Source:.*?\]/gi, '').trim();

            // 3. Traduzione della sinossi in italiano
            if (synopsis !== 'No synopsis available.' && deepLAuthKey !== 'TUA_API_KEY_QUI') {
                try {
                    const translator = new deepl.Translator(deepLAuthKey);
                    const result = await translator.translateText(synopsis, null, 'it');
                    synopsis = result.text;
                } catch (translationError) {
                    console.error('Error during translation:', translationError);
                    // Non bloccare l'esecuzione in caso di errore di traduzione, usa la sinossi originale.
                    synopsis = `*(Could not translate synopsis, displaying original in English)*\n\n` + synopsis;
                }
            } else if (deepLAuthKey === 'TUA_API_KEY_QUI') {
                synopsis = `*(Please add your DeepL API key to enable translation)*\n\n` + synopsis;
            }

            // Trunca la sinossi se troppo lunga
            if (synopsis.length > 1000) {
                synopsis = synopsis.substring(0, 997) + '...';
            }
            if (synopsis.length === 0) {
                synopsis = 'No synopsis available.';
            }

            // ... (il resto del tuo codice rimane invariato)
            const genres = anime.genres && anime.genres.length > 0
                ? anime.genres.map(g => g.name).join(', ')
                : 'N/A';

            const studios = anime.studios && anime.studios.length > 0
                ? anime.studios.map(s => s.name).join(', ')
                : 'N/A';

            const rating = anime.rating || 'N/A';
            const trailerUrl = anime.trailer && anime.trailer.url ? anime.trailer.url : 'N/A';

            const embed = new EmbedBuilder()
                .setColor('#FF99CC')
                .setTitle(anime.title)
                .setURL(anime.url)
                .setDescription(`*Alternative Titles: ${anime.title_japanese || 'N/A'}*`)
                .setThumbnail(anime.images.jpg.image_url || null)
                .addFields(
                    { name: '📝 Sinossi', value: synopsis, inline: false }, // Aggiornato a "Sinossi"
                    { name: '<:K3_episodes:1400824494540460043> Episodi', value: anime.episodes ? String(anime.episodes) : 'N/A', inline: true }, // Aggiornato a "Episodi"
                    { name: '<:K3_approved:1400814077596663808> Stato', value: anime.status || 'N/A', inline: true }, // Aggiornato a "Stato"
                    { name: '<:K3_onair:1291676245259456552> In onda', value: anime.aired.string || 'N/A', inline: true }, // Aggiornato a "In onda"
                    { name: '<:K3_star:1289918161294065724> Voto', value: anime.score ? `${anime.score} / 10` : 'N/A', inline: true }, // Aggiornato a "Voto"
                    { name: '🏷️ Generi', value: genres, inline: true }, // Aggiornato a "Generi"
                    { name: '🏢 Studio', value: studios, inline: true },
                    { name: '🔞 Rating', value: rating, inline: true }
                );

            if (trailerUrl !== 'N/A') {
                embed.addFields(
                    { name: '📺 Trailer', value: `[Guarda il Trailer](${trailerUrl})`, inline: false } // Aggiornato a "Guarda il Trailer"
                );
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error fetching anime data:', error);
            await interaction.editReply({
                content: `❌ An unexpected error occurred while fetching anime data.`,
                ephemeral: true
            });
        }
    },
};