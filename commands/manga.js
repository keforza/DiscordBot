// commands/manga.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch'); // Importa la libreria per fare richieste HTTP

module.exports = {
    // Definizione dei dati del comando slash
    data: new SlashCommandBuilder()
        .setName('manga')
        .setDescription('Cerca un manga su MangaDex.')
        .addStringOption(option =>
            option.setName('titolo')
                .setDescription('Il titolo del manga da cercare.')
                .setRequired(true)),
    
    // Logica di esecuzione del comando
    async execute(interaction) {
        // Ottiene il titolo del manga dall'opzione fornita dall'utente
        const query = interaction.options.getString('titolo');
        
        // Rispondi immediatamente per mostrare che il bot sta elaborando
        await interaction.deferReply({ ephemeral: false }); // Renderla effimera se non vuoi che tutti la vedano

        try {
            // Effettua la richiesta all'API di MangaDex
            const response = await fetch(`https://api.mangadex.org/manga?limit=1&title=${encodeURIComponent(query)}`);
            
            // Controlla se la richiesta ha avuto successo
            if (!response.ok) {
                await interaction.editReply(`❌ Errore durante la ricerca: ${response.status} ${response.statusText}`);
                return;
            }

            const data = await response.json(); // Parsa la risposta JSON

            // Controlla se sono stati trovati manga
            if (data.data && data.data.length > 0) {
                const manga = data.data[0]; // Prendi il primo risultato
                
                // Estrai le informazioni necessarie
                const titoloManga = manga.attributes.title.en || manga.attributes.title.ja || 'Titolo non disponibile';
                const descrizione = manga.attributes.description.en || 'Nessuna descrizione disponibile.';
                const idCopertina = manga.relationships.find(rel => rel.type === 'cover_art')?.id;
                let coverUrl = 'https://mangadex.org/img/avatar.png'; // Immagine predefinita

                // Se esiste un ID della copertina, cerca l'URL dell'immagine di copertina
                if (idCopertina) {
                    const coverResponse = await fetch(`https://api.mangadex.org/cover/${idCopertina}`);
                    const coverData = await coverResponse.json();
                    if (coverData.data && coverData.data.attributes.fileName) {
                        coverUrl = `https://uploads.mangadex.org/covers/${manga.id}/${coverData.data.attributes.fileName}`;
                    }
                }

                // Crea un embed per visualizzare le informazioni del manga
                const mangaEmbed = new EmbedBuilder()
                    .setColor(0x0099FF) // Un bel blu
                    .setTitle(titoloManga)
                    .setURL(`https://mangadex.org/title/${manga.id}`) // Link al manga su MangaDex
                    .setDescription(descrizione.length > 200 ? descrizione.substring(0, 197) + '...' : descrizione) // Tronca se troppo lunga
                    .setThumbnail(coverUrl) // Imposta la copertina
                    .addFields(
                        { name: 'Stato', value: manga.attributes.status || 'Sconosciuto', inline: true },
                        { name: 'Anni di Pubblicazione', value: manga.attributes.year?.toString() || 'Sconosciuto', inline: true },
                        { name: 'Tipo', value: manga.attributes.contentRating || 'Sconosciuto', inline: true }
                    )

                await interaction.editReply({ embeds: [mangaEmbed] }); // Invia l'embed come risposta
            } else {
                await interaction.editReply(`🔍 Nessun manga trovato per "${query}".`);
            }

        } catch (error) {
            // Gestione degli errori generici della richiesta
            console.error('Errore durante la ricerca del manga:', error);
            await interaction.editReply('❌ Si è verificato un errore durante la ricerca del manga. Riprova più tardi.');
        }
    }
};