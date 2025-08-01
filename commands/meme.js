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
                .setTitle(`😂 ${meme.title} 😂`) // Doppia emoji per enfasi
                .setURL(meme.postLink) // Link al post originale
                .setDescription(`_Un momento di pura ilarità! 😂_`) // Una piccola descrizione/introduzione
                .setImage(meme.url) // L'immagine del meme
                // Aggiunta di un campo per la fonte (Subreddit) e l'autore
                .addFields(
                    { name: '🌐 Subreddit', value: `\`r/${meme.subreddit}\``, inline: true }, // Usato backticks per evidenziare il subreddit
                    { name: '✍️ Autore', value: `\`u/${meme.author}\``, inline: true } // Usato backticks per evidenziare l'autore
                )
                .setFooter({
                    text: 'Meme offerto da K3Bot | powered by meme-api.com', // Messaggio più personalizzato nel footer
                    iconURL: interaction.client.user.displayAvatarURL() // Icona del bot nel footer
                })
                .setTimestamp(); // Mostra l'ora di generazione dell'embed

            await interaction.editReply({ embeds: [memeEmbed] });

        } catch (error) {
            console.error('Error fetching meme:', error);
            await interaction.editReply('Oops! There was a problem fetching the meme. Please try again later!');
        }
    },
};