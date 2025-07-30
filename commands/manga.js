// commands/manga.js
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
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
        // Il comportamento predefinito di deferReply è non-effimero, quindi non serve specificare flags per questo caso.
        await interaction.deferReply(); 

        try {
            // Effettua la richiesta all'API di MangaDex per cercare il manga
            const response = await fetch(`https://api.mangadex.org/manga?limit=1&title=${encodeURIComponent(query)}`);
            
            // Controlla se la richiesta API ha avuto successo
            if (!response.ok) {
                // Se la risposta non è OK (es. errore 404, 500), invia un messaggio di errore
                await interaction.editReply(`❌ Errore durante la ricerca: ${response.status} ${response.statusText}`);
                return; // Termina l'esecuzione della funzione
            }

            const data = await response.json(); // Parsa il corpo della risposta come oggetto JSON

            // Controlla se sono stati trovati manga nell'array 'data' della risposta
            if (data.data && data.data.length > 0) {
                const manga = data.data[0]; // Prende il primo risultato trovato
                
                // Estrai le informazioni del manga, fornendo fallback se non disponibili
                const titoloManga = manga.attributes.title.en || manga.attributes.title.ja || 'Titolo non disponibile';
                const descrizione = manga.attributes.description.en || 'Nessuna descrizione disponibile.';
                
                // Cerca l'ID dell'immagine di copertina nelle relazioni del manga
                const idCopertina = manga.relationships.find(rel => rel.type === 'cover_art')?.id;
                let coverUrl = 'https://mangadex.org/img/avatar.png'; // Immagine di copertina predefinita

                // Se è stato trovato un ID della copertina, fai una seconda richiesta API per ottenere il nome del file
                if (idCopertina) {
                    const coverResponse = await fetch(`https://api.mangadex.org/cover/${idCopertina}`);
                    const coverData = await coverResponse.json();
                    // Se i dati della copertina sono validi, costruisci l'URL completo
                    if (coverData.data && coverData.data.attributes.fileName) {
                        coverUrl = `https://uploads.mangadex.org/covers/${manga.id}/${coverData.data.attributes.fileName}`;
                    }
                }

                // Crea un Embed per visualizzare le informazioni del manga in modo accattivante
                const mangaEmbed = new EmbedBuilder()
                    .setColor(0x0099FF) // Colore della barra laterale dell'embed (un blu esadecimale)
                    .setTitle(titoloManga) // Titolo dell'embed
                    .setURL(`https://mangadex.org/title/${manga.id}`) // Link al manga su MangaDex
                    .setDescription(
                        // Tronca la descrizione se è troppo lunga, altrimenti usala intera
                        descrizione.length > 200 ? descrizione.substring(0, 197) + '...' : descrizione
                    )
                    .setThumbnail(coverUrl) // Imposta l'immagine di copertina come thumbnail
                    .addFields( // Aggiunge campi di informazione all'embed
                        { name: 'Stato', value: manga.attributes.status || 'Sconosciuto', inline: true }, // 'inline: true' li mette sulla stessa riga
                        { name: 'Anno di Pubblicazione', value: manga.attributes.year?.toString() || 'Sconosciuto', inline: true },
                        { name: 'Valutazione Contenuto', value: manga.attributes.contentRating || 'Sconosciuto', inline: true }
                    )
                    .setFooter({ text: 'Powered by MangaDex API' }) // Testo nel footer dell'embed
                    .setTimestamp(); // Aggiunge il timestamp attuale al footer

                // Invia l'embed come risposta, sostituendo il messaggio "bot sta pensando..."
                await interaction.editReply({ embeds: [mangaEmbed] }); 
            } else {
                // Se nessun manga è stato trovato, invia un messaggio di notifica
                await interaction.editReply(`🔍 Nessun manga trovato per "${query}".`);
            }

        } catch (error) {
            // Gestione degli errori generici che possono verificarsi durante la richiesta o l'elaborazione
            console.error('Errore durante la ricerca del manga:', error); // Stampa l'errore nella console del bot per debugging
            await interaction.editReply('❌ Si è verificato un errore durante la ricerca del manga. Riprova più tardi.'); // Avvisa l'utente
        }
    }
};