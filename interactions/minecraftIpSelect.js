// interactions/minecraftIpSelect.js
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
    customId: 'minecraft_edition_select', // L'ID personalizzato che il bot deve ascoltare
    async execute(interaction) {
        await interaction.deferUpdate(); // Riconosce l'interazione senza modificare il messaggio originale

        const selectedEdition = interaction.values[0]; 

        const serverIP = 'kappiani.falixsrv.me';
        const bedrockPort = '30862';

        let title = '';
        let description = '';
        const color = '#2ECC71'; 
        
        switch (selectedEdition) {
            case 'java':
                title = 'Minecraft Java Edition IP';
                description = `Connettiti al nostro server Java usando questo indirizzo:\n\n\`${serverIP.toUpperCase()}\``;
                break;
            case 'bedrock':
                title = 'Minecraft Bedrock Edition IP & Porta';
                description = `Connettiti al nostro server Bedrock usando questo indirizzo e porta:\n\nIndirizzo: \`${serverIP.toUpperCase()}\`\nPorta: \`**${bedrockPort}**\``;
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
            .setThumbnail('https://cdn.discordapp.com/attachments/1291444793058267256/1291444793058267256/minecraft_logo.png');

        // Invia la risposta effimera all'utente
        await interaction.followUp({ 
            content: 'Ecco le informazioni richieste:', 
            embeds: [embed], 
            ephemeral: true 
        });

        // --- Logica per resettare il dropdown nel messaggio originale ---
        const resetSelectMenu = new StringSelectMenuBuilder()
            .setCustomId('minecraft_edition_select')
            .setPlaceholder('Scegli l\'edizione di Minecraft...');

        const ipForDesc = 'kappiani.falixsrv.me'; 
        const portForDesc = '30862';

        resetSelectMenu.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Minecraft Java Edition')
                .setDescription(`Mostra l'indirizzo IP per Minecraft Java: ${ipForDesc.toUpperCase()}`)
                .setValue('java'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Minecraft Bedrock Edition')
                .setDescription(`Mostra l'indirizzo IP e la porta per Minecraft Bedrock: ${ipForDesc.toUpperCase()} (Porta: ${portForDesc})`)
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