const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Sends a random meme!'),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const response = await axios.get('https://meme-api.com/gimme');
            const meme = response.data;

            // Colore a tema "meme" più vivace e allegro
            const embedColor = '#FFD700'; // Oro, colore brillante e positivo

            const memeEmbed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle(`${meme.title}`)
                .setURL(meme.postLink) // Link al post originale
                .setImage(meme.url) // L'immagine del meme
                .setFooter({
                    text: 'Meme offerto da ✨Kappiani Bot✨ | powered by meme-api.com', // Messaggio più personalizzato nel footer
                    iconURL: interaction.guild.iconURL() // Icona del server nel footer
                })
            await interaction.editReply({ embeds: [memeEmbed] });

        } catch (error) {
            console.error('Error fetching meme:', error);
            await interaction.editReply('Oops! There was a problem fetching the meme. Please try again later!');
        }
    },
};