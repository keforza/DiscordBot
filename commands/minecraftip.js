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

        const serverIP = 'kappiani.falixsrv.me'; 
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

        // --- MODIFICA QUI: Aggiunto '\n' all'inizio del content ---
        await interaction.editReply({ 
            content: '\nSeleziona l\'edizione del server Minecraft:', // Aggiunto il carattere di nuova riga
            components: [row] 
        });
    },
};