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
            .setCustomId('minecraft_edition_select') // Questo ID deve corrispondere a quello in index.js
            .setPlaceholder('Scegli l\'edizione di Minecraft...');

        // Inizializza l'IP per le descrizioni delle opzioni
        const serverIP = 'kappiani.falixsrv.me'; 
        const bedrockPort = '30862';

        select.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Minecraft Java Edition')
                .setDescription('Mostra l\'indirizzo IP per Minecraft Java: ' + serverIP.toUpperCase()) // Descrizione Java
                .setValue('java'), 
            new StringSelectMenuOptionBuilder()
                .setLabel('Minecraft Bedrock Edition')
                // MODIFICA QUI: Aggiunto il backtick all'IP Bedrock nella descrizione del dropdown
                .setDescription(`Mostra l\'indirizzo IP e la porta per Minecraft Bedrock: ${serverIP} (Porta: ${bedrockPort})`) // Descrizione Bedrock
                .setValue('bedrock'), 
        );

        const row = new ActionRowBuilder()
            .addComponents(select);

        await interaction.editReply({ 
            content: 'Seleziona l\'edizione del server Minecraft:',
            components: [row] 
        });
    },
};