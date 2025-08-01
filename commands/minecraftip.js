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

        const serverIP = 'kappiani.serveminecraft.net';
        const bedrockPort = '30862';

        select.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Minecraft Java Edition')
                .setDescription(`Visualizza l'indirizzo IP per Minecraft Java`)
                .setValue('java'), 
            new StringSelectMenuOptionBuilder()
                .setLabel('Minecraft Bedrock Edition')
                .setDescription(`Visualizza l'indirizzo IP e la porta per Minecraft Bedrock`)
                .setValue('bedrock'), 
        );

        const row = new ActionRowBuilder()
            .addComponents(select);

        const initialEmbed = new EmbedBuilder()
            .setColor('#3498DB')
            .setTitle('Server Minecraft')
            .setDescription(
                'Il server Kappiani è dedicato a tutti i follower di K3Forza; all\'interno di questo server, puoi giocare un vero Minecraft Vanilla con amici e anche persone che non conosci.\n' +
                'È importante notare che il server è CROSS-PLATFORM, quindi non devi preoccuparti affatto di quale versione stai giocando. Detto questo, ti auguro un buon divertimento :)'
            )
            .setImage('https://cdn.discordapp.com/attachments/1338470846154543134/1388071543669522462/server_Minecraft.png?ex=685fa5dd&is=685e545d&hm=9d81694716f1dde9387e60579df30ad97bc09157a1149cd4c1f8cb31bfa0204f&')
            .setFooter({ text: 'Seleziona l\'edizione del server Minecraft dal menu a tendina qui sotto:' });

        await interaction.editReply({ 
            content: '',
            embeds: [initialEmbed],
            components: [row]
        });
    },
};