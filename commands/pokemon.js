// commands/pokemon.js
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: {
        name: 'pokemon',
        description: 'Searches for information about a Pokémon.', // English
        options: [
            {
                name: 'name',
                description: 'Name of the Pokémon to search for.', // English
                type: 3, // STRING
                required: true
            }
        ]
    },
    async execute(interaction) { // Removed 'ephemeralReply' parameter
        await interaction.deferReply(); // Defer the reply immediately

        const name = interaction.options.getString('name').toLowerCase();
        try {
            const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            if (!pokeRes.ok) {
                return interaction.editReply({ content: '❌ Pokémon not found. Check the name and try again.', ephemeral: true }); // English
            }
            const pokeData = await pokeRes.json();

            const speciesRes = await fetch(pokeData.species.url);
            if (!speciesRes.ok) {
                return interaction.editReply({ content: '❌ Could not retrieve species data for this Pokémon.', ephemeral: true }); // English
            }
            const speciesData = await speciesRes.json();

            const generation = speciesData.generation.name
                .split('-')
                .map((w, i) => i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w.toUpperCase())
                .join(' ');

            const types = pokeData.types.map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)).join(', ');

            const embed = new EmbedBuilder()
                .setColor('#006D5B') // Retaining original color
                .setTitle(`${pokeData.name.charAt(0).toUpperCase() + pokeData.name.slice(1)} (#${pokeData.id})`)
                .setThumbnail(pokeData.sprites.front_default)
                .addFields(
                    { name: 'Type', value: types, inline: true }, // English
                    { name: 'Height', value: `${pokeData.height / 10} m`, inline: true }, // English
                    { name: 'Weight', value: `${pokeData.weight / 10} kg`, inline: true }, // English
                    { name: 'Generation', value: generation, inline: true } // English
                );

            await interaction.editReply({ embeds: [embed] }); // Use editReply since we deferred

        } catch (err) {
            console.error('❌ Pokémon API Error:', err.message); // English
            await interaction.editReply({ content: `🚫 Pokémon Error: ${err.message}`, ephemeral: true }); // English
        }
    }
};