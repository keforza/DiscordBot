// commands/twitch.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('twitch')
        .setDescription('Ricerca un canale Twitch e mostra le sue informazioni.')
        .addStringOption(option =>
            option.setName('search')
                .setDescription('Inserisci il nome del canale da cercare')
                .setRequired(true)),
    async execute(interaction) {
        // Defer della risposta per evitare timeout, poiché le chiamate API potrebbero richiedere tempo.
        await interaction.deferReply();

        const search = interaction.options.getString('search');
        try {
            // --- Passo 1: Ottenere un Access Token dall'API di Twitch ---
            // Questo token è necessario per tutte le richieste API.
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
                console.error('❌ Errore nell\'ottenere il token di Twitch:', tokenData);
                return await interaction.editReply('🚫 Errore di autenticazione con l\'API di Twitch.');
            }

            // --- Passo 2: Ottenere i dati dell'utente (incluso l'ID) ---
            const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${search}`, {
                headers: {
                    'Client-ID': process.env.TWITCH_CLIENT_ID,
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const userData = await userRes.json();
            const user = userData.data[0];

            if (!user) {
                return await interaction.editReply(`❌ Canale **${search}** non trovato.`);
            }

            // --- Passo 3: Ottenere il conteggio dei follower ---
            const followersRes = await fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${user.id}`, {
                headers: {
                    'Client-ID': process.env.TWITCH_CLIENT_ID,
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const followersData = await followersRes.json();
            const followerCount = followersData.total || 0;

            // --- Passo 4: Controllare se il canale è in live ---
            const streamRes = await fetch(`https://api.twitch.tv/helix/streams?user_id=${user.id}`, {
                headers: {
                    'Client-ID': process.env.TWITCH_CLIENT_ID,
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const streamData = await streamRes.json();
            const stream = streamData.data[0]; // Se l'array è vuoto, il canale è offline.

            // --- Passo 5: Creare e inviare l'embed ---
            const embed = new EmbedBuilder()
                .setColor('#9146FF') // Colore viola di Twitch
                .setTitle(user.display_name)
                .setURL(`https://www.twitch.tv/${user.login}`) // Aggiunge un link diretto al canale
                .setThumbnail(user.profile_image_url)
                .setDescription(user.description || 'Nessuna descrizione disponibile.')
                .addFields(
                    { name: '📅 Account Creato', value: new Date(user.created_at).toLocaleDateString('it-IT'), inline: true },
                    { name: `<:K3_invite:1289918660185555014> Follower`, value: `${followerCount.toLocaleString('it-IT')}`, inline: true }
                );

            if (stream) {
                // Se lo streamer è live, aggiungi le informazioni sulla live
                embed.addFields(
                    { name: 'Stato', value: '**LIVE** 🔴', inline: false },
                    { name: '📺 Titolo', value: stream.title, inline: true },
                    { name: '🎮 Gioco', value: stream.game_name, inline: true },
                    { name: '👀 Spettatori', value: stream.viewer_count.toLocaleString('it-IT'), inline: true }
                );
                // Imposta l'immagine dell'embed con la miniatura del live
                embed.setImage(stream.thumbnail_url.replace('{width}', '1280').replace('{height}', '720'));
            } else {
                // Se lo streamer è offline
                embed.addFields({ name: 'Stato', value: '**Offline**', inline: false });
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error('❌ Errore API di Twitch:', err.message);
            await interaction.editReply(`🚫 Si è verificato un errore: **${err.message}**`);
        }
    }
};