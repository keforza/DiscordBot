const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Mostra informazioni sul server corrente.'),
    async execute(interaction, ephemeralReply) {
        if (!interaction.guild) {
            return interaction.reply(ephemeralReply('Questo comando può essere usato solo in un server Discord.'));
        }

        const guild = interaction.guild;
        const owner = await guild.fetchOwner(); // Ottiene l'oggetto proprietario per il tag

        const embed = new EmbedBuilder()
            .setColor('#00800') //Colore verde
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

        await interaction.reply({ embeds: [embed] });
    },
};