const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anime')
        .setDescription('Cerca informazioni su un anime specifico.')
        .addStringOption(option =>
            option.setName('search')
                .setDescription('Il nome dell\'anime da cercare.')
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
                    content: `❌ Anime "${searchQuery}" non trovato. Prova con un nome diverso o più specifico.`, 
                    ephemeral: true 
                });
            }

            const anime = data.data[0];

            let synopsis = anime.synopsis || 'Nessuna sinossi disponibile.';
            
            // NUOVA LOGICA: Rimuovi "[Written by MAL Rewrite]" dalla sinossi
            if (synopsis.includes('[Written by MAL Rewrite]')) {
                synopsis = synopsis.replace('[Written by MAL Rewrite]', '').trim();
            }

            // Tronca la sinossi se è troppo lunga per l'embed
            if (synopsis.length > 1024) {
                synopsis = synopsis.substring(0, 1021) + '...';
            }

            const embed = new EmbedBuilder()
                .setColor('#2E588F')
                .setTitle(anime.title)
                .setURL(anime.url)
                .setThumbnail(anime.images.jpg.image_url || null)
                .addFields(
                    { name: 'Sinossi', value: synopsis, inline: false },
                    { name: 'Episodi', value: anime.episodes ? String(anime.episodes) : 'N/D', inline: true },
                    { name: 'Stato', value: anime.status || 'N/D', inline: true },
                    { name: 'In onda dal', value: anime.aired.string || 'N/D', inline: true },
                    { name: 'Punteggio', value: anime.score ? String(anime.score) : 'N/D', inline: true },
                    { name: 'Generi', value: anime.genres.map(g => g.name).join(', ') || 'N/D', inline: true }
                )
                .setFooter({ text: `Dati forniti da MyAnimeList (tramite Jikan API)` });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Errore durante la ricerca anime:', error);
            await interaction.editReply({ 
                content: `❌ Si è verificato un errore durante il recupero dei dati dell'anime. Riprova più tardi.`, 
                ephemeral: true 
            });
        }
    },
};