// commands/manga.js
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const fetch = require('node-fetch'); // Import the library for making HTTP requests

module.exports = {
    // Definition of the slash command data
    data: new SlashCommandBuilder()
        .setName('manga')
        .setDescription('Searches for a manga on MangaDex.')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('The title of the manga to search for.')
                .setRequired(true)),
    
    // Command execution logic
    async execute(interaction) {
        // Get the manga title from the option provided by the user
        const query = interaction.options.getString('title');
        
        // Respond immediately to show that the bot is processing
        // The default behavior of deferReply is non-ephemeral, so no need to specify flags for this case.
        await interaction.deferReply(); 

        try {
            // Make the request to the MangaDex API to search for the manga
            const response = await fetch(`https://api.mangadex.org/manga?limit=1&title=${encodeURIComponent(query)}`);
            
            // Check if the API request was successful
            if (!response.ok) {
                // If the response is not OK (e.g., 404, 500 error), send an error message
                await interaction.editReply(`❌ Error during search: ${response.status} ${response.statusText}`);
                return; // Terminate function execution
            }

            const data = await response.json(); // Parse the response body as a JSON object

            // Check if any manga were found in the 'data' array of the response
            if (data.data && data.data.length > 0) {
                const manga = data.data[0]; // Take the first result found
                
                // Extract manga information, providing fallbacks if not available
                const mangaTitle = manga.attributes.title.en || manga.attributes.title.ja || 'Title not available';
                const description = manga.attributes.description.en || 'No description available.';
                
                // Search for the cover image ID in the manga's relationships
                const coverId = manga.relationships.find(rel => rel.type === 'cover_art')?.id;
                let coverUrl = 'https://mangadex.org/img/avatar.png'; // Default cover image

                // If a cover ID was found, make a second API request to get the file name
                if (coverId) {
                    const coverResponse = await fetch(`https://api.mangadex.org/cover/${coverId}`);
                    const coverData = await coverResponse.json();
                    // If the cover data is valid, construct the full URL
                    if (coverData.data && coverData.data.attributes.fileName) {
                        coverUrl = `https://uploads.mangadex.org/covers/${manga.id}/${coverData.data.attributes.fileName}`;
                    }
                }

                // Create an Embed to display the manga information in an appealing way
                const mangaEmbed = new EmbedBuilder()
                    .setColor(0x0099FF) // Embed sidebar color (a hexadecimal blue)
                    .setTitle(mangaTitle) // Embed title
                    .setURL(`https://mangadex.org/title/${manga.id}`) // Link to the manga on MangaDex
                    .setDescription(
                        // Truncate the description if too long, otherwise use it in full
                        description.length > 200 ? description.substring(0, 197) + '...' : description
                    )
                    .setThumbnail(coverUrl) // Set the cover image as the thumbnail
                    .addFields( // Add information fields to the embed
                        { name: 'Status', value: manga.attributes.status || 'Unknown', inline: true }, // 'inline: true' places them on the same line
                        { name: 'Publication Year', value: manga.attributes.year?.toString() || 'Unknown', inline: true },
                        { name: 'Content Rating', value: manga.attributes.contentRating || 'Unknown', inline: true }
                    )
                    .setFooter({ text: 'Powered by MangaDex API' }) // Footer text for the embed
                    .setTimestamp(); // Add the current timestamp to the footer

                // Send the embed as a reply, replacing the "bot is thinking..." message
                await interaction.editReply({ embeds: [mangaEmbed] }); 
            } else {
                // If no manga was found, send a notification message
                await interaction.editReply(`🔍 No manga found for "${query}".`);
            }

        } catch (error) {
            // Generic error handling that may occur during the request or processing
            console.error('Error during manga search:', error); // Print the error to the bot's console for debugging
            await interaction.editReply('❌ An error occurred while searching for the manga. Please try again later.'); // Notify the user
        }
    }
};