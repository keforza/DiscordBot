// interactions/minecraftIpSelect.js
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
    customId: 'minecraft_edition_select', 
    async execute(interaction) {
        await interaction.deferUpdate(); 

        // --- QUI DEVI METTERE IL TUO NUOVO DOMINIO NO-IP E LA PORTA ---
        const serverIP = 'kappiani.serveminecraft.net'; // <--- IL TUO NUOVO DOMINIO NO-IP
        const bedrockPort = '30862'; // <--- LA TUA PORTA ESATTA
        // --- FINE AGGIORNAMENTO IP/PORTA ---

        const selectedEdition = interaction.values[0]; 

        let title = '';
        let description = '';
        const color = '#2ECC71'; 
        
        switch (selectedEdition) {
            case 'java':
                title = 'Minecraft Java Edition IP';
                // *** MODIFICA EFFETTUATA QUI: AGGIUNTA LA PORTA PER JAVA ***
                description = `Connettiti al server Java usando questo indirizzo:\n\n\`${serverIP.toUpperCase()}:${bedrockPort}\``;
                break;
            case 'bedrock':
                title = 'Minecraft Bedrock Edition IP & Porta';
                // Qui mostriamo l'IP e la porta effettivi
                description = `Connettiti al server Bedrock usando questo indirizzo e porta:\n\nIndirizzo: \`${serverIP.toUpperCase()}\`\nPorta: \`**${bedrockPort}**\``;
                break;
            default:
                title = 'Errore';
                description = 'Selezione non valida.';
                break;
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(description)
            .setImage('https://cdn.discordapp.com/attachments/1338470846154543134/1388071543669522462/server_Minecraft.png?ex=685fa5dd&is=685e545d&hm=9d81694716f1dde9387e60579df30ad97bc09157a1149cd4c1f8cb31bfa0204f&');

        await interaction.followUp({ 
            content: 'Ecco le informazioni richieste:', 
            embeds: [embed], 
            ephemeral: true 
        });

        // --- Logica per resettare il dropdown nel messaggio originale ---
        const resetSelectMenu = new StringSelectMenuBuilder()
            .setCustomId('minecraft_edition_select') 
            .setPlaceholder('Scegli l\'edizione di Minecraft...');

        // Per le descrizioni del dropdown resettato, usiamo le stesse descrizioni generiche
        // Se volessi mostrare l'IP anche qui, dovresti usare serverIP e portForDesc
        const ipForDesc = 'kappiani.serveminecraft.net'; // Questo è per le descrizioni delle opzioni (se le volessi)
        const portForDesc = '30862';

        resetSelectMenu.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Minecraft Java Edition')
                .setDescription(`Mostra l'indirizzo IP per Minecraft Java`) // Qui le metto generiche come nel comando
                .setValue('java'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Minecraft Bedrock Edition')
                .setDescription(`Mostra l'indirizzo IP e la porta per Minecraft Bedrock`) // Qui le metto generiche come nel comando
                .setValue('bedrock'),
        );

        const resetActionRow = new ActionRowBuilder()
            .addComponents(resetSelectMenu);

        try {
            await interaction.message.edit({
                components: [resetActionRow]
            });
            console.log('Dropdown resettato con successo.');
        } catch (error) {
            console.error('Errore durante il reset del dropdown:', error);
        }
    },
};