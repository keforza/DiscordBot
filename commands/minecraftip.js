// commands/minecraftip.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'minecraftip',
        description: 'Invia l\'indirizzo IP del server Minecraft per Java o Bedrock.', // Descrizione aggiornata
        options: [
            {
                name: 'edizione', // Nome dell'opzione
                description: 'Scegli l\'edizione di Minecraft (Java o Bedrock).', // Descrizione dell'opzione
                type: 3, // STRING
                required: true,
                choices: [ // Le scelte per l'utente
                    { name: 'Java Edition', value: 'java' },
                    { name: 'Bedrock Edition', value: 'bedrock' }
                ]
            }
        ]
    },
    async execute(interaction) {
        // Deferisci la risposta, rendendola effimera (visibile solo all'utente che ha usato il comando)
        await interaction.deferReply({ ephemeral: true }); 

        const edition = interaction.options.getString('edizione'); // Recupera la scelta dell'utente

        const serverIP = 'kappiani.falixsrv.me'; // L'indirizzo IP comune
        const bedrockPort = '30862'; // La porta specifica per Bedrock

        let title = '';
        let description = '';
        const color = '#2ECC71'; // Un colore verde che si addice a Minecraft

        switch (edition) {
            case 'java':
                title = 'Minecraft Java Edition IP';
                // Java: solo l'indirizzo IP, in maiuscolo e in blocco di codice
                description = `Connettiti al nostro server Java usando questo indirizzo:\n\n\`${serverIP.toUpperCase()}\``;
                break;
            case 'bedrock':
                title = 'Minecraft Bedrock Edition IP & Porta';
                // Bedrock: indirizzo IP non in linea (testo normale) e porta in grassetto
                description = `Connettiti al nostro server Bedrock usando questo indirizzo e porta:\n\nIndirizzo: ${serverIP}\nPorta: **${bedrockPort}**`;
                break;
            default:
                // Questo caso non dovrebbe verificarsi grazie alle 'choices'
                title = 'Errore';
                description = 'Selezione dell\'edizione non valida.';
                break;
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(description)
            .setThumbnail('https://cdn.discordapp.com/attachments/1291444793058267256/1291444793058267256/minecraft_logo.png'); // Sostituisci con il tuo URL del logo

        await interaction.editReply({ embeds: [embed] });
    },
};