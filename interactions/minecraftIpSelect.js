// interactions/minecraftIpSelect.js
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags } = require('discord.js');

module.exports = {
    customId: 'minecraft_edition_select', 
    async execute(interaction) {
        // CAMBIO CHIAVE QUI: Usiamo le Flags per il messaggio effimero
        await interaction.deferReply({ flags: MessageFlags.Ephemeral }); 

        const serverIP = 'kappiani.serveminecraft.net'; 
        const serverPort = '30862'; 

        const selectedEdition = interaction.values[0]; 

        let title = '';
        let description = '';
        let thumbnailUrl = ''; // Nuova variabile per l'URL della thumbnail
        const color = '#2ECC71'; 
        
        switch (selectedEdition) {
            case 'java':
                title = 'Minecraft Java Edition';
                description = `Connettiti al server Java:\n\n**\`${serverIP.toUpperCase()}:${serverPort}\`**`;
                thumbnailUrl = 'https://cdn.discordapp.com/attachments/1338470846154543134/1388125898997497896/minecraft_java.png?ex=685fd87c&is=685e86fc&hm=dec8bafe9ee9a72c2f53afc00976d234f35d26078a7f5fb919f4de5cc0c04e99&'; // Thumbnail per Java
                break;
            case 'bedrock':
                title = 'Minecraft Bedrock Edition';
                description = `Connettiti al server Bedrock:\n\nIndirizzo IP: **\`${serverIP.toUpperCase()}\`**\nPorta: **\`${serverPort}\`**`;
                thumbnailUrl = 'https://cdn.discordapp.com/attachments/1338470846154543134/1388125898686857349/minecraft_bedrock.png?ex=685fd87c&is=685e86fc&hm=e589e6b39a646cc796c49b31c2c82bf398476a70ed0cc0b8aa5d0ca830a25e20&'; // Thumbnail per Bedrock
                break;
            default:
                title = 'Errore';
                description = 'Selezione non valida.';
                thumbnailUrl = ''; // Nessuna thumbnail per errore
                break;
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(description)
                        
        // Aggiungi la thumbnail solo se l'URL è definito
        if (thumbnailUrl) {
            embed.setThumbnail(thumbnailUrl);
        }

        // La logica di editReply rimane la stessa, dato che l'ephemeral è già gestito da deferReply con le flags
        await interaction.editReply({ 
            embeds: [embed], 
            components: [], // Rimuovi i componenti per pulire il messaggio di risposta
        });

        // --- Logica per resettare il dropdown nel messaggio ORIGINALE ---
        const resetSelectMenu = new StringSelectMenuBuilder()
            .setCustomId('minecraft_edition_select') 
            .setPlaceholder('Scegli l\'edizione di Minecraft...');

        resetSelectMenu.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Minecraft Java Edition')
                .setDescription(`Mostra l'indirizzo IP per Minecraft Java`)
                .setValue('java'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Minecraft Bedrock Edition')
                .setDescription(`Mostra l'indirizzo IP e la porta per Minecraft Bedrock`)
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