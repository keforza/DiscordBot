// interactions/minecraftIpSelect.js
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
    customId: 'minecraft_edition_select', 
    async execute(interaction) {
        // CAMBIO CHIAVE QUI: Usiamo deferReply con ephemeral: true
        // per indicare che la risposta successiva sarà un nuovo messaggio privato.
        await interaction.deferReply({ ephemeral: true }); 

        const serverIP = 'kappiani.serveminecraft.net'; 
        const serverPort = '30862'; 

        const selectedEdition = interaction.values[0]; 

        let title = '';
        let description = '';
        const color = '#2ECC71'; 
        
        switch (selectedEdition) {
            case 'java':
                title = 'Minecraft Java Edition IP';
                description = `Connettiti al server Java usando questo indirizzo:\n\n**\`${serverIP.toUpperCase()}:${serverPort}\`**\n(Ricorda di specificare la porta **${serverPort}** perché non è quella standard.)`;
                break;
            case 'bedrock':
                title = 'Minecraft Bedrock Edition IP & Porta';
                description = `Connettiti al server Bedrock usando questo indirizzo e porta:\n\nIndirizzo: **\`${serverIP.toUpperCase()}\`**\nPorta: **\`${serverPort}\`**`;
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

        // CAMBIO CHIAVE QUI: Usiamo editReply perché abbiamo deferito l'interazione con deferReply.
        // Questo aggiornerà il messaggio "Il bot sta pensando..." con le informazioni.
        await interaction.editReply({ 
            content: 'Ecco le informazioni richieste:', 
            embeds: [embed], 
            components: [], // Rimuove i componenti dal messaggio privato di risposta
            // ephemeral: true non serve qui, è già gestito da deferReply
        });

        // --- Logica per resettare il dropdown nel messaggio ORIGINALE ---
        // Questa parte è separata dalla risposta effimera e si occupa di ripristinare il menu nel messaggio iniziale.
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
            // Qui modifichiamo il messaggio originale del comando /minecraftip.
            // È importante che 'interaction.message' sia il messaggio da modificare.
            await interaction.message.edit({
                components: [resetActionRow]
            });
            console.log('Dropdown resettato con successo.');
        } catch (error) {
            console.error('Errore durante il reset del dropdown:', error);
            // Questo errore può avvenire se il messaggio originale è stato cancellato o non è accessibile.
        }
    },
};