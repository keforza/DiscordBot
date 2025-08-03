const { EmbedBuilder } = require('discord.js');

// Mappa dei colori per i tipi di Pokémon
const typeColors = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    grass: '#7AC74C',
    electric: '#F7D02C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    steel: '#B7B7CE',
    dark: '#705746',
    fairy: '#D685AD'
};

module.exports = {
    data: {
        name: 'pokemon',
        description: 'Cerca informazioni su un Pokémon',
        options: [
            {
                name: 'name',
                description: 'Nome del Pokémon da cercare',
                type: 3, // STRING
                required: true
            }
        ]
    },
    // Non passiamo più 'ephemeralReply' come parametro, gestiamo 'ephemeral' direttamente
    async execute(interaction) {
        let interactionAcknowledged = false; // Flag per tracciare se deferReply è andato a buon fine

        try {
            // Deferisce la risposta all'interazione. Questo è fondamentale per i comandi lunghi.
            // Deve essere chiamato entro 3 secondi dall'invio del comando.
            await interaction.deferReply({ ephemeral: false });
            interactionAcknowledged = true; // Segna che il deferimento è avvenuto con successo

            const name = interaction.options.getString('name').toLowerCase();
            const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);

            if (!pokeRes.ok) {
                // Se il Pokémon non viene trovato, editiamo la risposta già deferita
                return await interaction.editReply({
                    content: '❌ **Pokémon non trovato.** Controlla il nome e riprova.',
                    ephemeral: true // Questo messaggio sarà visibile solo all'utente
                });
            }
            const pokeData = await pokeRes.json();

            const speciesRes = await fetch(pokeData.species.url);
            if (!speciesRes.ok) {
                // Se i dati della specie non possono essere recuperati
                return await interaction.editReply({
                    content: '❌ **Impossibile recuperare i dati della specie** per questo Pokémon.',
                    ephemeral: true
                });
            }
            const speciesData = await speciesRes.json();

            // Trova la descrizione in inglese (o la prima disponibile)
            const flavorTextEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
            const description = flavorTextEntry ? flavorTextEntry.flavor_text.replace(/\n/g, ' ').replace(/\f/g, ' ') : 'Nessuna descrizione disponibile.';

            // Formatta il nome della generazione
            const generation = speciesData.generation.name
                .split('-')
                .map((w, i) => i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w.toUpperCase())
                .join(' ');

            // Formatta i tipi e determina il colore dell'embed
            const types = pokeData.types.map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)).join(', ');
            const mainType = pokeData.types[0].type.name; // Prende il primo tipo per il colore
            const embedColor = typeColors[mainType] || '#006D5B'; // Colore predefinito se il tipo non è mappato

            // Costruisci l'Embed
            const embed = new EmbedBuilder()
                .setColor(embedColor) // Colore dinamico basato sul tipo
                .setTitle(`${pokeData.name.charAt(0).toUpperCase() + pokeData.name.slice(1)} (#${pokeData.id})`)
                .setDescription(description)
                .setThumbnail(pokeData.sprites.front_default) // Immagine piccola in alto a destra
                .setImage(pokeData.sprites.other['official-artwork'].front_default) // Immagine principale più grande
                .addFields(
                    { name: '<:K3_energy:1400829273236832337> Tipo', value: types, inline: true }, // Emoji per il tipo
                    { name: '📏 Altezza', value: `${pokeData.height / 10} m`, inline: true },
                    { name: '⚖️ Peso', value: `${pokeData.weight / 10} kg`, inline: true },
                    { name: '🌳 Generazione', value: generation, inline: true } // Emoji per la generazione
                );

            // Edita la risposta deferita con l'embed completo
            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            // Gestione degli errori:
            // Registra l'errore completo per il debug (aggiungi err.code se disponibile)
            console.error('❌ Pokémon API Error:', err.message, err.code || 'N/A'); 
            const errorMessage = `🚫 **Si è verificato un errore imprevisto** durante il recupero dei dati del Pokémon. Riprova più tardi.`;

            // Logica per rispondere all'interazione in caso di errore, 
            // tenendo conto se è stata già deferita o meno.
            if (interactionAcknowledged || interaction.deferred || interaction.replied) {
                // Se l'interazione è stata deferita (o ha già ricevuto una risposta),
                // tentiamo di modificare la risposta esistente.
                try {
                    await interaction.editReply({ content: errorMessage, ephemeral: true });
                } catch (editError) {
                    console.error('Failed to edit reply after error, attempting followUp:', editError.message);
                    // Se editReply fallisce (es. interazione scaduta dopo defer), proviamo con followUp.
                    try {
                        await interaction.followUp({ content: errorMessage, ephemeral: true });
                    } catch (followUpError) {
                        console.error('Completely failed to send followUp after error:', followUpError.message);
                    }
                }
            } else {
                // Se l'interazione NON è stata deferita in tempo (es. errore prima di deferReply, timeout iniziale),
                // dobbiamo rispondere per la prima volta.
                try {
                    await interaction.reply({ content: errorMessage, ephemeral: true });
                } catch (replyError) {
                    console.error('Failed to send initial reply after error, attempting followUp:', replyError.message);
                    // Se reply fallisce (es. interazione completamente non valida), proviamo con followUp.
                    try {
                        await interaction.followUp({ content: errorMessage, ephemeral: true });
                    } catch (finalError) {
                        console.error('Completely failed to respond to interaction in catch block:', finalError.message);
                    }
                }
            }
        }
    }
};