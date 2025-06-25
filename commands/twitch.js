// commands/twitch.js
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch'); // Assicurati che node-fetch sia installato e importato

module.exports = {
    data: {
        name: 'twitch',
        description: 'Cerca uno streamer su twitch',
        options: [
            {
                name: 'search',
                description: 'Digita il nome dello/della streamer da cercare',
                type: 3, // STRING
                required: true
            }
        ]
    },
    async execute(interaction, ephemeralReply) {
        const search = interaction.options.getString('search');
        try {
            const tokenRes = await fetch('https://id.twitch.tv/oauth2/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: process.env.TWITCH_CLIENT_ID,
                    client_secret: process.env.TWITCH_CLIENT_SECRET,
                    grant_type: 'client_credentials'
                })
            });

            const tokenData = await tokenRes.json();
            const accessToken = tokenData.access_token;

            const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${search}`, {
                headers: {
                    'Client-ID': process.env.TWITCH_CLIENT_ID,
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const userData = await userRes.json();
            const user = userData.data[0];

            if (!user) return interaction.reply(ephemeralReply('❌ Streamer non trovato.'));

            const embed = new EmbedBuilder()
                .setColor('#9146FF')
                .setTitle(user.display_name)
                .setThumbnail(user.profile_image_url)
                .setDescription(user.description || 'Nessuna descrizione disponibile.')
                .addFields(
                    { name: '📅 Creato il', value: new Date(user.created_at).toLocaleDateString('it-IT'), inline: true },
                    { name: 'Profilo Twitch', value: `[${user.display_name}](https://www.twitch.tv/${user.login})` }
                );

            await interaction.reply({ embeds: [embed] }); // Non è un comando di moderazione, quindi non effimero

        } catch (err) {
            console.error('❌ Errore Twitch API:', err.message);
            await interaction.reply(ephemeralReply(`🚫 Errore Twitch: ${err.message}`));
        }
    }
};