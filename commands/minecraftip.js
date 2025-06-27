// commands/minecraftip.js
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'minecraftip',
        description: 'Seleziona l\'edizione di Minecraft per visualizzare l\'IP.',
    },
    async execute(interaction) {
        // Deferisci la risposta, sarà pubblica (visibile a tutti)
        await interaction.deferReply(); 

        // Crea le opzioni per il dropdown (Select Menu)
        const select = new StringSelectMenuBuilder()
            .setCustomId('minecraft_edition_select') // Questo ID è cruciale! Lo useremo per identificarlo nel gestore.
            .setPlaceholder('Scegli l\'edizione di Minecraft...'); // Testo predefinito mostrato nel menu

        // Aggiungi le opzioni "Java Edition" e "Bedrock Edition" al dropdown
        select.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Minecraft Java Edition')
                .setDescription('Mostra l\'indirizzo IP per Minecraft Java.')
                .setValue('java'), // Il valore che verrà inviato quando selezionato
            new StringSelectMenuOptionBuilder()
                .setLabel('Minecraft Bedrock Edition')
                .setDescription('Mostra l\'indirizzo IP e la porta per Minecraft Bedrock.')
                .setValue('bedrock'), // Il valore che verrà inviato quando selezionato
        );

        // Crea una ActionRow per contenere il dropdown. I componenti devono essere in ActionRow.
        const row = new ActionRowBuilder()
            .addComponents(select);

        // Invia il messaggio che contiene il dropdown
        await interaction.editReply({ 
            content: 'Seleziona l\'edizione del server Minecraft:',
            components: [row] // Qui passiamo la ActionRow con il dropdown
        });
    },
};