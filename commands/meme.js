const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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

            // Colore a tema "meme" o vivace
            const embedColor = '#FF5733'; // Un arancione brillante, puoi cambiarlo con un altro hex code

            const memeEmbed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle(`😂 ${meme.title}`) // Aggiunta emoji al titolo
                .setURL(meme.postLink)
                .setImage(meme.url)
                .addFields(
                    { name: '🌐 Subreddit', value: `r/${meme.subreddit}`, inline: true }, // Campo dedicato al Subreddit
                    { name: '✍️ Autore', value: `u/${meme.author}`, inline: true } // Campo dedicato all'Autore
                )
                .setFooter({ text: 'Powered by meme-api.com' }) // Footer più pulito
                .setTimestamp(); // Aggiunge la data e l'ora di generazione del meme

            await interaction.editReply({ embeds: [memeEmbed] });

        } catch (error) {
            console.error('Error fetching meme:', error); // Messaggio di errore più specifico nel log
            await interaction.editReply('Oops! There was a problem fetching the meme. Please try again later!');
        }
    },
};