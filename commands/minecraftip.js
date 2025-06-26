// commands/minecraftip.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'minecraftip',
        description: 'Invia l\'indirizzo IP del server Minecraft per Java o Bedrock.',
        options: [
            {
                name: 'edizione',
                description: 'Scegli l\'edizione di Minecraft (Java o Bedrock).',
                type: 3, // STRING
                required: true,
                choices: [
                    { name: 'Java Edition', value: 'java' },
                    { name: 'Bedrock Edition', value: 'bedrock' }
                ]
            }
        ]
    },
    async execute(interaction) {
        // Deferisci la risposta, rendendola PUBBLICA (visibile a tutti)
        await interaction.deferReply(); // Rimosso { ephemeral: true }

        const edition = interaction.options.getString('edizione');

        const serverIP = 'kappiani.falixsrv.me';
        const bedrockPort = '30862';

        let title = '';
        let description = '';
        const color = '#2ECC71';

        switch (edition) {
            case 'java':
                title = 'Minecraft Java Edition IP';
                description = `Connettiti al nostro server Java usando questo indirizzo:\n\n\`${serverIP.toUpperCase()}\``;
                break;
            case 'bedrock':
                title = 'Minecraft Bedrock Edition IP & Porta';
                description = `Connettiti al nostro server Bedrock usando questo indirizzo e porta:\n\nIndirizzo: ${serverIP}\nPorta: **${bedrockPort}**`;
                break;
            default:
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