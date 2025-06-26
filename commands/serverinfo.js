const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Mostra informazioni sul server corrente.'),
    async execute(interaction, ephemeralReply) {
        // --- QUESTO È IL CAMBIAMENTO FONDAMENTALE: Deferisce la risposta immediatamente ---
        await interaction.deferReply({ ephemeral: false }); // Dice a Discord: "Sto elaborando, attendi."

        if (!interaction.guild) {
            // --- MODIFICATO: Usa editReply qui, perché l'interazione è già stata deferita ---
            return interaction.editReply(ephemeralReply('Questo comando può essere usato solo in un server Discord.'));
        }

        const guild = interaction.guild;
        const owner = await guild.fetchOwner(); // Questa operazione ora ha più tempo per completarsi

        const embed = new EmbedBuilder()
            .setColor('#008000') // Il colore verde scuro desiderato
            .setTitle(`Info sul Server: ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 256 })) // Icona del server
            .addFields(
                { name: '🆔 ID Server', value: guild.id, inline: true },
                { name: '👑 Proprietario', value: `${owner.user.tag} (${owner.id})`, inline: true },
                { name: '👥 Membri totali', value: `${guild.memberCount}`, inline: true },
                { name: '💬 Canali totali', value: `${guild.channels.cache.size}`, inline: true },
                { name: '💼 Ruoli totali', value: `${guild.roles.cache.size}`, inline: true },
                { name: '📅 Creato il', value: guild.createdAt.toLocaleDateString('it-IT'), inline: true },
                { name: '✨ Livello Boost', value: `${guild.premiumTier}`, inline: true },
                { name: '🚀 Boost', value: `${guild.premiumSubscriptionCount || 0}`, inline: true }
            )
            .setFooter({ text: `Richiesto da ${interaction.user.tag}` })
            .setTimestamp();

        // --- MODIFICATO: Usa editReply per inviare la risposta finale ---
        await interaction.editReply({ embeds: [embed] }); // Modifica la risposta deferita con l'embed completo
    },
};