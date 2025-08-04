const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

// Map of colors for Pokémon types
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
        description: 'Searches for information about a Pokémon',
        options: [
            {
                name: 'name',
                description: 'Name of the Pokémon to search for',
                type: 3, // STRING
                required: true
            }
        ]
    },
    async execute(interaction, ephemeralReply) {
        // Defer the reply to allow time for data retrieval
        await interaction.deferReply({ ephemeral: false });

        const name = interaction.options.getString('name').toLowerCase();
        try {
            const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            if (!pokeRes.ok) {
                return interaction.editReply(ephemeralReply('❌ **Pokémon not found.** Check the name and try again.'));
            }
            const pokeData = await pokeRes.json();

            const speciesRes = await fetch(pokeData.species.url);
            if (!speciesRes.ok) {
                return interaction.editReply(ephemeralReply('❌ **Could not retrieve species data** for this Pokémon.'));
            }
            const speciesData = await speciesRes.json();

            // Get the English description (or the first available)
            const flavorTextEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
            const description = flavorTextEntry ? flavorTextEntry.flavor_text.replace(/\n/g, ' ').replace(/\f/g, ' ') : 'No description available.';

            const generation = speciesData.generation.name
                .split('-')
                .map((w, i) => i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w.toUpperCase())
                .join(' ');

            const types = pokeData.types.map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)).join(', ');
            const mainType = pokeData.types[0].type.name; // Get the first type for the color
            const embedColor = typeColors[mainType] || '#006D5B'; // Default color if type is not mapped

            const embed = new EmbedBuilder()
                .setColor(embedColor) // Dynamic color based on type
                .setTitle(`${pokeData.name.charAt(0).toUpperCase() + pokeData.name.slice(1)} (#${pokeData.id})`)
                .setDescription(description) // Added description
                .setThumbnail(pokeData.sprites.front_default) // Keeps front_default as thumbnail for a small image in the top right
                .setImage(pokeData.sprites.other['official-artwork'].front_default) // Larger main image
                .addFields(
                    { name: '<:K3_energy:1400829273236832337> Type', value: types, inline: true }, // More appropriate emoji for type
                    { name: '📏 Height', value: `${pokeData.height / 10} m`, inline: true },
                    { name: '⚖️ Weight', value: `${pokeData.weight / 10} kg`, inline: true },
                    { name: '<:K3_pokeball:1401904419674783754> Generation', value: generation, inline: true } // Emoji for generation
                )
            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error('❌ Pokémon API Error:', err.message);
            await interaction.editReply(ephemeralReply(`🚫 **An unexpected error occurred** while fetching Pokémon data. Please try again later.`));
        }
    }
};