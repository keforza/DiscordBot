const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

// Funzione ausiliaria per calcolare la differenza di tempo in modo leggibile
function getRelativeTimeAgo(date) {
    const now = new Date();
    const diff = now.getTime() - date.getTime(); // Differenza in millisecondi

    // Conversione in unità di tempo
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    // Calcolo anni e mesi basato su giorni medi
    const years = Math.floor(days / 365.25);
    const months = Math.floor(days / 30.44);

    let result = [];

    if (years > 0) {
        result.push(`${years} anno${years === 1 ? '' : 'i'}`);
    }
    // Aggiungi i mesi rimanenti solo se non sono già coperti da anni completi
    const remainingMonths = months % 12;
    if (remainingMonths > 0 && years < 10) { // Limita l'aggiunta di mesi se ci sono molti anni per concisione
        result.push(`${remainingMonths} mese${remainingMonths === 1 ? '' : 'i'}`);
    }
    
    // Aggiungi giorni solo se non ci sono anni o mesi significativi
    if (years === 0 && months === 0 && days > 0) {
        result.push(`${days} giorno${days === 1 ? '' : 'i'}`);
    } else if (years === 0 && months === 0 && days === 0 && hours > 0) {
        result.push(`${hours} ora${hours === 1 ? '' : 'e'}`);
    } else if (years === 0 && months === 0 && days === 0 && hours === 0 && minutes > 0) {
        result.push(`${minutes} minuto${minutes === 1 ? '' : 'i'}`);
    } else if (years === 0 && months === 0 && days === 0 && hours === 0 && minutes === 0 && seconds > 0) {
        result.push(`${seconds} secondo${seconds === 1 ? '' : 'i'}`);
    } else if (result.length === 0) {
        return "meno di un minuto"; // Se non c'è una differenza significativa
    }

    return result.join(', ') + ' fa';
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Mostra informazioni dettagliate su un utente del server. Tutti i campi copiabili.') // Descrizione accorciata
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Seleziona un utente di cui visualizzare le informazioni (predefinito: te stesso).')
                .setRequired(false)),

    async execute(interaction) {
        // Ho mantenuto il deferReply iniziale per prevenire l'errore "Unknown interaction"
        try {
            await interaction.deferReply({ ephemeral: false }); 
        } catch (error) {
            console.error("Errore nel deferReply:", error);
            return; 
        }

        const targetUser = interaction.options.getUser('user') || interaction.user;
        let targetMember;

        try {
            targetMember = await interaction.guild.members.fetch(targetUser.id);
        } catch (error) {
            console.error(`Errore nel recupero del membro per l'utente ${targetUser.id}: ${error}`);
            // Se fetch fallisce, modifica la reply che è già stata deferita.
            return interaction.editReply({ content: '❌ Impossibile trovare l\'utente specificato in questo server.', ephemeral: true });
        }

        // --- Preparazione dei Dati per l'Embed ---

        const roles = targetMember.roles.cache
            .filter(role => role.name !== '@everyone')
            .sort((a, b) => b.position - a.position)
            .map(role => `${role.name}`)
            .join(', ');

        const nickname = targetMember.nickname || 'No nickname';
        const isBoosting = targetMember.premiumSince ? 'Yes' : 'No';

        // Formattazione delle date: MM/DD/YYYY HH:MM (senza virgola, come da richiesta)
        const dateOptions = {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false // Formato 24 ore
        };

        // *************** CORREZIONE QUI: sostituito ', ' con ' ' per rimuovere la virgola ***************
        const accountCreatedDateFormatted = targetUser.createdAt.toLocaleString('en-US', dateOptions).replace(', ', ' ');
        const joinedServerDateFormatted = targetMember.joinedAt.toLocaleString('en-US', dateOptions).replace(', ', ' ');
        // ************************************************************************************************

        // ************** NUOVA PARTE: Calcolo del periodo di tempo **************
        const accountCreatedPeriod = getRelativeTimeAgo(targetUser.createdAt);
        const joinedServerPeriod = getRelativeTimeAgo(targetMember.joinedAt);
        // ************************************************************************

        let globalPermissionsValue = 'None';
        if (targetMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
            globalPermissionsValue = '👑 Administrator (all permissions)';
        } else {
            const readablePermissions = targetMember.permissions.toArray()
                .map(perm => perm.replace(/([A-Z])/g, ' $1').trim())
                .join(', ');
            if (readablePermissions.length > 0) {
                globalPermissionsValue = readablePermissions;
            }
        }
        
        // --- Costruzione dell'Embed ---
        const embed = new EmbedBuilder()
            .setColor(0x2B2D31) // Colore scuro per replicare lo stile dei blocchi di codice
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                // Username e User ID - ora entrambi in blocchi multiline
                { name: 'Username', value: `\`\`\`${targetUser.username}\`\`\``, inline: false },
                { name: 'User ID', value: `\`\`\`${targetUser.id}\`\`\``, inline: false },
                
                // Ruoli - già in blocco multiline
                { 
                    name: `Roles [${targetMember.roles.cache.filter(r => r.id !== interaction.guild.id).size}] (shows up to 10 roles)`, 
                    value: `\`\`\`${roles.length > 0 ? roles : 'No roles'}\`\`\``, 
                    inline: false 
                },

                // Nickname e Is boosting - ora entrambi in blocchi multiline
                { name: 'Nickname', value: `\`\`\`${nickname}\`\`\``, inline: false },
                { name: 'Is boosting', value: `\`\`\`${isBoosting}\`\`\``, inline: false },

                // Permessi Globali - già in blocco multiline
                { name: 'Global permissions', value: `\`\`\`${globalPermissionsValue}\`\`\``, inline: false }, 

                // Date - ora con formattazione MM/DD/YYYY HH:MM (periodo calcolato)
                { 
                    name: 'Joined this server on (MM/DD/YYYY)', 
                    value: `\`\`\`${joinedServerDateFormatted} (${joinedServerPeriod})\`\`\``, 
                    inline: false 
                },
                { 
                    name: 'Account created on (MM/DD/YYYY)', 
                    value: `\`\`\`${accountCreatedDateFormatted} (${accountCreatedPeriod})\`\`\``, 
                    inline: false 
                }
            );

        await interaction.editReply({ embeds: [embed] });
    }
};