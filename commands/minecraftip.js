// commands/minecraftip.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'minecraftip',
        description: 'Invia l\'indirizzo IP del server Minecraft.',
    },
    async execute(interaction) {
        // Deferisci la risposta, rendendola effimera (visibile solo all'utente che ha usato il comando)
        await interaction.deferReply({ ephemeral: true }); 

        const serverIP = 'kappiani.falixsrv.me'; // L'indirizzo del server Minecraft

        const embed = new EmbedBuilder()
            .setColor('#2ECC71') // Un colore verde che si addice a Minecraft
            .setTitle('Indirizzo IP del Server Minecraft')
            .setDescription(`Connettiti al nostro server Minecraft usando questo indirizzo:\n\n\`${serverIP}\``)
            .setThumbnail('https://cdn.discordapp.com/attachments/1291444793058267256/1291444793058267256/minecraft_logo.png'); // Sostituisci con il tuo URL del logo

        // Invia la risposta finale con l'embed, mantenendola effimera
        await interaction.editReply({ embeds: [embed] });
    },
};