// commands/minecraftip.js
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'minecraftip',
        description: 'Seleziona l\'edizione di Minecraft per visualizzare l\'IP.',
    },
    async execute(interaction) {
        await interaction.deferReply(); 

        const select = new StringSelectMenuBuilder()
            .setCustomId('minecraft_edition_select')
            .setPlaceholder('Scegli l\'edizione di Minecraft...');

        // Qui definisci l'IP e la porta, ma non li usiamo nelle descrizioni del dropdown stesso
        const serverIP = 'kappiani.serveminecraft.net'; // <-- Il tuo nuovo dominio No-IP
        const bedrockPort = '30862'; // <-- La tua porta

        select.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Minecraft Java Edition')
                .setDescription(`Mostra l'indirizzo IP per Minecraft Java`) // Descrizione più generica
                .setValue('java'), 
            new StringSelectMenuOptionBuilder()
                .setLabel('Minecraft Bedrock Edition')
                .setDescription(`Mostra l'indirizzo IP e la porta per Minecraft Bedrock`) // Descrizione più generica
                .setValue('bedrock'), 
        );

        const row = new ActionRowBuilder()
            .addComponents(select);

        await interaction.editReply({ 
            content: '\nSeleziona l\'edizione del server Minecraft:',
            components: [row] 
        });
    },
};