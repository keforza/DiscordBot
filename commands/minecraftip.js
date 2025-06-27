// commands/minecraftip.js
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'minecraftip',
        description: 'Seleziona l\'edizione di Minecraft per visualizzare l\'IP.',
    },
    async execute(interaction) {
        // Defer della risposta iniziale, come sempre
        await interaction.deferReply(); 

        // Creazione del Select Menu (dropdown)
        const select = new StringSelectMenuBuilder()
            .setCustomId('minecraft_edition_select')
            .setPlaceholder('Scegli l\'edizione di Minecraft...');

        // Le tue variabili IP e porta (non usate direttamente nel dropdown, ma servono per le descrizioni se volessi)
        const serverIP = 'kappiani.serveminecraft.net';
        const bedrockPort = '30862';

        select.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Minecraft Java Edition')
                .setDescription(`Mostra l'indirizzo IP per Minecraft Java`)
                .setValue('java'), 
            new StringSelectMenuOptionBuilder()
                .setLabel('Minecraft Bedrock Edition')
                .setDescription(`Mostra l'indirizzo IP e la porta per Minecraft Bedrock`)
                .setValue('bedrock'), 
        );

        const row = new ActionRowBuilder()
            .addComponents(select);

        // --- INSERIAMO L'IMMAGINE E IL TESTO IN UN EMBED QUI ---
        const initialEmbed = new EmbedBuilder()
            .setColor('#3498DB') // Un colore esadecimale per il bordo dell'embed
            .setTitle('Server Minecraft') // Puoi dare un titolo all'embed
            .setDescription('Seleziona l\'edizione del server Minecraft dal menu a tendina qui sotto:') // Questo sarà il testo sopra il dropdown
            .setImage('https://cdn.discordapp.com/attachments/1338470846154543134/1388071543669522462/server_Minecraft.png?ex=685fa5dd&is=685e545d&hm=9d81694716f1dde9387e60579df30ad97bc09157a1149cd4c1f8cb31bfa0204f&');
            // ^^^ Ho usato .setImage() per un'immagine a piena larghezza sopra il testo.
            // Se preferisci una piccola immagine nell'angolo in alto a destra, usa .setThumbnail() invece di .setImage().

        // Aggiorna la risposta con l'embed e i componenti
        await interaction.editReply({ 
            content: '', // Il contenuto testuale diretto può essere vuoto se il testo è nell'embed
            embeds: [initialEmbed], // Passa l'embed che hai appena creato
            components: [row] // Passa la ActionRow con il dropdown
        });
    },
};