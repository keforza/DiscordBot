const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

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
        const name = interaction.options.getString('name').toLowerCase();
        try {
            const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            if (!pokeRes.ok) return interaction.reply(ephemeralReply('❌ Pokémon not found. Check the name and try again.'));
            const pokeData = await pokeRes.json();

            const speciesRes = await fetch(pokeData.species.url);
            if (!speciesRes.ok) return interaction.reply(ephemeralReply('❌ Could not retrieve species data for this Pokémon.'));
            const speciesData = await speciesRes.json();

            const generation = speciesData.generation.name
                .split('-')
                .map((w, i) => i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w.toUpperCase())
                .join(' ');

            const types = pokeData.types.map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)).join(', ');

            const embed = new EmbedBuilder()
                .setColor('#006D5B')
                .setTitle(`${pokeData.name.charAt(0).toUpperCase() + pokeData.name.slice(1)} (#${pokeData.id})`)
                .setThumbnail(pokeData.sprites.front_default)
                .addFields(
                    { name: '<:K3_energy:1400829273236832337> Type', value: types, inline: true },
                    { name: '↕️ Height', value: `${pokeData.height / 10} m`, inline: true },
                    { name: '⚖️ Weight', value: `${pokeData.weight / 10} kg`, inline: true },
                    { name: 'Generation', value: generation, inline: true }
                );

            await interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error('❌ Pokémon API Error:', err.message);
            await interaction.reply(ephemeralReply(`🚫 Pokémon Error: ${err.message}`));
        }
    }
};