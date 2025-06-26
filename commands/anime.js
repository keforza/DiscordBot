const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch'); // Assicurati che node-fetch sia installato e importato

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anime')
        .setDescription('Cerca informazioni su un anime specifico.') // Tradotto
        .addStringOption(option =>
            option.setName('search')
                .setDescription('Il nome dell\'anime da cercare.') // Tradotto
                .setRequired(true)
        ),
    
    async execute(interaction) {
        // Deferisce la risposta, dato che la chiamata API potrebbe richiedere del tempo
        await interaction.deferReply();

        const searchQuery = interaction.options.getString('search');

        try {
            // Chiamata all'API Jikan per cercare l'anime
            const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchQuery)}&limit=1`);
            const data = await response.json();

            // Controlla se ci sono risultati
            if (!data || !data.data || data.data.length === 0) {
                return interaction.editReply({ 
                    content: `❌ Anime "${searchQuery}" non trovato. Prova con un nome diverso o più specifico.`, // Tradotto
                    ephemeral: true 
                });
            }

            const anime = data.data[0]; // Prende il primo risultato

            // Tronca la sinossi se è troppo lunga per l'embed
            let synopsis = anime.synopsis || 'Nessuna sinossi disponibile.'; // Tradotto
            if (synopsis.length > 1024) { // Limite di campo embed è 1024 caratteri
                synopsis = synopsis.substring(0, 1021) + '...';
            }

            const embed = new EmbedBuilder()
                .setColor('#2E588F') // Colore blu scuro, tipico di MyAnimeList
                .setTitle(anime.title)
                .setURL(anime.url) // Link a MyAnimeList
                .setThumbnail(anime.images.jpg.image_url || null) // Immagine di copertina
                .addFields(
                    { name: 'Sinossi', value: synopsis, inline: false }, // Tradotto
                    { name: 'Episodi', value: anime.episodes ? String(anime.episodes) : 'N/D', inline: true }, // Tradotto N/A in N/D
                    { name: 'Stato', value: anime.status || 'N/D', inline: true }, // Tradotto
                    { name: 'In onda dal', value: anime.aired.string || 'N/D', inline: true }, // Tradotto Aired in In onda dal
                    { name: 'Punteggio', value: anime.score ? String(anime.score) : 'N/D', inline: true }, // Tradotto
                    { name: 'Generi', value: anime.genres.map(g => g.name).join(', ') || 'N/D', inline: true } // Tradotto
                )
                .setFooter({ text: `Dati forniti da MyAnimeList (tramite Jikan API)` }); // Tradotto e rimosso .setTimestamp()

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Errore durante la ricerca anime:', error);
            await interaction.editReply({ 
                content: `❌ Si è verificato un errore durante il recupero dei dati dell'anime. Riprova più tardi.`, // Tradotto
                ephemeral: true 
            });
        }
    },
};