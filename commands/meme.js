// commands/meme.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios'); // Assicurati di aver installato 'axios' con 'npm install axios'

module.exports = {
    // Definizione dei dati del comando slash
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Invia un meme casuale!'),

    // Logica di esecuzione del comando
    async execute(interaction) {
        // Metti il bot in stato di "sta digitando..." mentre recupera il meme
        await interaction.deferReply();

        try {
            // Effettua una richiesta GET all'API dei meme
            const response = await axios.get('https://meme-api.com/gimme');
            const meme = response.data; // L'oggetto 'meme' contiene i dati restituiti dall'API

            // Crea un Embed per visualizzare il meme in modo più accattivante su Discord
            const memeEmbed = new EmbedBuilder()
                .setColor(0x0099ff) // Un bel colore blu per l'embed
                .setTitle(meme.title) // Il titolo del meme (spesso il titolo del post Reddit)
                .setURL(meme.postLink) // Il link al post originale su Reddit
                .setImage(meme.url) // L'URL dell'immagine del meme
                .setFooter({ text: `Subreddit: r/${meme.subreddit} | Autore: u/${meme.author}` }); // Info aggiuntive

            // Invia l'embed con il meme come risposta all'interazione
            await interaction.editReply({ embeds: [memeEmbed] });

        } catch (error) {
            // Gestione degli errori nel caso la richiesta API fallisca
            console.error('Errore durante il recupero del meme:', error);
            await interaction.editReply('Ops! C\'è stato un problema nel recuperare il meme. Riprova più tardi!');
        }
    },
};