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

            const memeEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(meme.title)
                .setURL(meme.postLink)
                .setImage(meme.url)
                .setFooter({ text: `Subreddit: r/${meme.subreddit} | Author: u/${meme.author}` });

            await interaction.editReply({ embeds: [memeEmbed] });

        } catch (error) {
            console.error(error);
            await interaction.editReply('Oops! There was a problem fetching the meme. Please try again later!');
        }
    },
};