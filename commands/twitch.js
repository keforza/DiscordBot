// commands/twitch.js
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch'); // Make sure node-fetch is installed and imported

module.exports = {
    data: {
        name: 'twitch',
        description: 'Searches for a streamer on Twitch',
        options: [
            {
                name: 'search',
                description: 'Type the name of the streamer to search for',
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

            if (!user) return interaction.reply(ephemeralReply('❌ Streamer not found.'));

            const embed = new EmbedBuilder()
                .setColor('#9146FF') // Twitch's brand color
                .setTitle(user.display_name)
                .setThumbnail(user.profile_image_url)
                .setDescription(user.description || 'No description available.')
                .addFields(
                    { name: '📅 Created On', value: new Date(user.created_at).toLocaleDateString('en-US'), inline: true }, // Changed locale to 'en-US' for English formatting
                    { name: '<:K3_Twitch:1409435097039507569> Twitch Profile', value: `[${user.display_name}](https://www.twitch.tv/${user.login})` }
                );

            await interaction.reply({ embeds: [embed] }); // Not a moderation command, so not ephemeral

        } catch (err) {
            console.error('❌ Twitch API Error:', err.message);
            await interaction.reply(ephemeralReply(`🚫 Twitch Error: ${err.message}`));
        }
    }
};