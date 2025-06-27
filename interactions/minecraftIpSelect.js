// interactions/minecraftIpSelect.js
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
    customId: 'minecraft_edition_select', 
    async execute(interaction) {
        await interaction.deferUpdate(); 

        const serverIP = 'kappiani.serveminecraft.net'; 
        const serverPort = '30862'; // <--- RINOMINATA DA bedrockPort a serverPort per chiarezza, è la tua porta UNICA

        const selectedEdition = interaction.values[0]; 

        let title = '';
        let description = '';
        const color = '#2ECC71'; 
        
        switch (selectedEdition) {
            case 'java':
                title = 'Minecraft Java Edition IP';
                // *** CORREZIONE QUI: Usa serverPort anche per Java ***
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

        // Qui c'è un'altra piccola ottimizzazione per la risposta. 
        // Poiché hai usato deferUpdate() all'inizio, è meglio usare editReply() per aggiornare il messaggio originale.
        // followUp() creerebbe un *nuovo* messaggio, che potrebbe non essere l'intento.
        await interaction.editReply({ // <-- CAMBIATO DA followUp() a editReply()
            content: 'Ecco le informazioni richieste:', 
            embeds: [embed], 
            components: [], // Rimuovi il select menu dopo la selezione per evitare ulteriori selezioni sullo stesso messaggio
            ephemeral: true 
        });

        // --- Logica per resettare il dropdown nel messaggio originale ---
        // Questo blocco è separato e sta gestendo il messaggio originale del comando /minecraftip.
        // Qui non devi cambiare nulla, dato che stai ripristinando il menu originale.
        // Il tuo errore Interaction has already been acknowledged. NON viene da questo file, ma da un uso precedente.
        // La causa dell'errore (Interaction has already been acknowledged) non era qui, ma nel modo in cui l'errore veniva gestito nel bot.js, 
        // e la mia ipotesi era che fosse nel comando o in questo gestore se facevi reply() più di una volta.
        // Visto che qui usi deferUpdate() e poi editReply(), questo file è corretto nel suo approccio.
        // L'errore che hai visto nei log era probabilmente legato a come il bot.js gestiva gli errori in generale.
        // La parte sotto per il reset del dropdown va bene così com'è.

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
            await interaction.message.edit({ // Questo modifica il messaggio originale del comando /minecraftip
                components: [resetActionRow]
            });
            console.log('Dropdown resettato con successo.');
        } catch (error) {
            console.error('Errore durante il reset del dropdown:', error);
        }
    },
};