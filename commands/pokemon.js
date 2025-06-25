// commands/pokemon.js
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: {
        name: 'pokemon',
        description: 'Cerca informazioni su un Pokémon',
        options: [
            {
                name: 'name',
                description: 'Nome del pokémon da cercare',
                type: 3, // STRING
                required: true
            }
        ]
    },
    async execute(interaction, ephemeralReply) {
        const name = interaction.options.getString('name').toLowerCase();
        try {
            const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            if (!pokeRes.ok) return interaction.reply(ephemeralReply('❌ Pokémon non trovato. Controlla il nome e riprova.'));
            const pokeData = await pokeRes.json();

            const speciesRes = await fetch(pokeData.species.url);
            if (!speciesRes.ok) return interaction.reply(ephemeralReply('❌ Impossibile recuperare dati specie per questo Pokémon.'));
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
                    { name: 'Tipo', value: types, inline: true },
                    { name: 'Altezza', value: `${pokeData.height / 10} m`, inline: true },
                    { name: 'Peso', value: `${pokeData.weight / 10} kg`, inline: true },
                    { name: 'Generazione', value: generation, inline: true }
                );

            await interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error('❌ Errore Pokémon API:', err.message);
            await interaction.reply(ephemeralReply(`🚫 Errore Pokémon: ${err.message}`));
        }
    }
};