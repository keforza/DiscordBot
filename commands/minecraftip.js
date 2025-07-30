// commands/minecraftip.js
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'minecraftip',
        description: 'Select the Minecraft edition to view the IP.',
    },
    async execute(interaction) {
        // Defer the initial reply, as always
        await interaction.deferReply(); 

        // Create the Select Menu (dropdown)
        const select = new StringSelectMenuBuilder()
            .setCustomId('minecraft_edition_select')
            .setPlaceholder('Choose Minecraft Edition...');

        // Your IP and port variables (not directly used in the dropdown, but useful for descriptions if you wanted)
        const serverIP = 'kappiani.serveminecraft.net';
        const bedrockPort = '30862';

        select.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Minecraft Java Edition')
                .setDescription(`Displays the IP address for Minecraft Java`)
                .setValue('java'), 
            new StringSelectMenuOptionBuilder()
                .setLabel('Minecraft Bedrock Edition')
                .setDescription(`Displays the IP address and port for Minecraft Bedrock`)
                .setValue('bedrock'), 
        );

        const row = new ActionRowBuilder()
            .addComponents(select);

        // --- UPDATED EMBED WITH NEW DESCRIPTION AND FOOTER ---
        const initialEmbed = new EmbedBuilder()
            .setColor('#3498DB') // A hexadecimal color for the embed border
            .setTitle('Minecraft Server') // Embed title
            .setDescription(
                'The Kappiani server is dedicated to all K3Forza followers; within this server, you can play a true Minecraft Vanilla with friends and even people you don\'t know.\n' +
                'It\'s worth noting that the server is CROSS-PLATFORM, so you don\'t have to worry at all about which version you\'re playing. That said, I wish you a good stay :)'
            )
            .setImage('https://cdn.discordapp.com/attachments/1338470846154543134/1388071543669522462/server_Minecraft.png?ex=685fa5dd&is=685e545d&hm=9d81694716f1dde9387e60579df30ad97bc09157a1149cd4c1f8cb31bfa0204f&')
            .setFooter({ text: 'Select the Minecraft server edition from the dropdown menu below:' }); // Footer text
        // --- END EMBED UPDATE ---

        // Update the reply with the embed and components
        await interaction.editReply({ 
            content: '', // Direct textual content can be empty if the text is in the embed
            embeds: [initialEmbed], // Pass the embed you just created
            components: [row] // Pass the ActionRow with the dropdown
        });
    },
};