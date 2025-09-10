// commands/twitch.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    // The data property of a command is where you configure its name, description, and options.
    // It's a best practice to use SlashCommandBuilder for this.
    data: new SlashCommandBuilder()
        .setName('twitch')
        .setDescription('Searches for a streamer on Twitch and shows their profile info.')
        .addStringOption(option =>
            option.setName('search')
                .setDescription('Type the name of the streamer to search for')
                .setRequired(true)),
    async execute(interaction, ephemeralReply) {
        await interaction.deferReply(); // Defer the reply to give the API time to respond

        const search = interaction.options.getString('search');
        try {
            // --- Step 1: Get an App Access Token from Twitch ---
            // This is required for almost all Helix API requests.
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
            if (!accessToken) {
                console.error('❌ Failed to get Twitch access token:', tokenData);
                return await interaction.editReply('🚫 Failed to authenticate with Twitch API.');
            }

            // --- Step 2: Get User Data (including user ID) ---
            const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${search}`, {
                headers: {
                    'Client-ID': process.env.TWITCH_CLIENT_ID,
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const userData = await userRes.json();
            const user = userData.data[0];

            if (!user) {
                return await interaction.editReply(`❌ Streamer **${search}** not found.`);
            }

            // --- Step 3: Get Follower Count ---
            // The API requires the user's ID, which we got in the previous step.
            const followersRes = await fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${user.id}`, {
                headers: {
                    'Client-ID': process.env.TWITCH_CLIENT_ID,
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const followersData = await followersRes.json();
            const followerCount = followersData.total || 0;

            // --- Step 4: Check if the Streamer is Live ---
            const streamRes = await fetch(`https://api.twitch.tv/helix/streams?user_id=${user.id}`, {
                headers: {
                    'Client-ID': process.env.TWITCH_CLIENT_ID,
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const streamData = await streamRes.json();
            const stream = streamData.data[0]; // If the array is empty, they are offline.

            // --- Step 5: Build and Send the Embed ---
            const embed = new EmbedBuilder()
                .setColor('#9146FF')
                .setTitle(`Twitch Profile: ${user.display_name}`)
                .setURL(`https://www.twitch.tv/${user.login}`) // Add a direct link to the profile
                .setThumbnail(user.profile_image_url)
                .setDescription(user.description || 'No description available.')
                .addFields(
                    { name: '👤 Username', value: user.display_name, inline: true },
                    { name: 'ID', value: user.id, inline: true },
                    { name: '📅 Account Created', value: new Date(user.created_at).toLocaleDateString('en-US'), inline: true },
                    { name: '❤️ Followers', value: `${followerCount.toLocaleString()}`, inline: true } // Format the number
                );

            if (stream) {
                // Add a field for live stream details
                embed.addFields(
                    { name: '<:K3_Twitch:1409435097039507569> Status', value: `**Live!**`, inline: false },
                    { name: '📺 Title', value: stream.title, inline: true },
                    { name: '🎮 Playing', value: stream.game_name, inline: true },
                    { name: '👀 Viewers', value: stream.viewer_count.toLocaleString(), inline: true }
                );
                embed.setImage(stream.thumbnail_url.replace('{width}', '1280').replace('{height}', '720')); // Show a live thumbnail
            } else {
                // Add a field for offline status
                embed.addFields({ name: '<:K3_Twitch:1409435097039507569> Status', value: '**Offline**', inline: false });
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error('❌ Twitch API Error:', err.message);
            await interaction.editReply(`🚫 Twitch Error: **${err.message}**`);
        }
    }
};