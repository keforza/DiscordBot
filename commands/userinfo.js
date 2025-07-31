const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    // Convertito a SlashCommandBuilder per una definizione più moderna e leggibile
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Mostra informazioni su un utente.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Seleziona un utente di cui visualizzare le informazioni (predefinito: te stesso).')
                .setRequired(false)), // Impostato su false: se non specifichi un utente, mostrerà le tue info.

    async execute(interaction) {
        // Differisce la risposta pubblicamente. L'utente vedrà "Il bot sta pensando..."
        await interaction.deferReply();

        // **Nota sui Permessi:**
        // Il tuo codice originale includeva un controllo PermissionsBitField.Flags.ManageMessages.
        // I comandi UserInfo di solito sono accessibili a tutti gli utenti.
        // Se vuoi che solo i moderatori possano usare questo comando, rimuovi i commenti dalle righe qui sotto
        // E anche la riga `default_member_permissions` nella sezione `data` del comando.
        /*
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.editReply({ content: '🚫 Solo i moderatori possono usare questo comando.', ephemeral: true });
        }
        */

        // Recupera l'utente target: l'utente specificato nell'opzione, altrimenti l'utente che ha invocato il comando.
        const targetUser = interaction.options.getUser('user') || interaction.user;
        let targetMember;

        try {
            // Tenta di recuperare l'oggetto GuildMember per informazioni specifiche del server.
            // Questo è necessario per ruoli, nickname, data di ingresso nel server.
            targetMember = await interaction.guild.members.fetch(targetUser.id);
        } catch (error) {
            console.error(`Errore nel recupero del membro per l'utente ${targetUser.id}: ${error}`);
            // Se l'utente non viene trovato nel server (es. ID non valido, utente non nel server),
            // invia un messaggio di errore effimero.
            return interaction.editReply({ content: '❌ Impossibile trovare l\'utente specificato in questo server.', ephemeral: true });
        }

        // --- Preparazione dei Dati per l'Embed ---
        // Filtra il ruolo @everyone, ordina per posizione (i ruoli più alti prima) e menzionali.
        const roles = targetMember.roles.cache
            .filter(role => role.name !== '@everyone')
            .sort((a, b) => b.position - a.position)
            .map(role => `<@&${role.id}>`)
            .join(', ');

        const nickname = targetMember.nickname || 'Nessuno'; // Nickname nel server, se non impostato, "Nessuno"
        const isBoosting = targetMember.premiumSince ? 'Sì' : 'No'; // Controlla se l'utente sta boostando il server

        // Utilizzo dei timestamp di Discord per date dinamiche e localizzate (molto meglio di toLocaleString)
        // <t:timestamp:F> -> Data e ora complete (es. "1 gennaio 2023 10:00")
        // <t:timestamp:R> -> Tempo relativo (es. "2 giorni fa")
        const accountCreatedTimestamp = Math.floor(targetUser.createdTimestamp / 1000);
        const joinedServerTimestamp = Math.floor(targetMember.joinedTimestamp / 1000);

        // --- Costruzione dell'Embed per una Migliore Grafica ---
        const embed = new EmbedBuilder()
            .setColor('#00AAFF') // Mantieni il colore che hai scelto
            // Utilizza setAuthor per mostrare il nome utente e l'avatar in cima, più pulito del solo titolo
            .setAuthor({
                name: `${targetUser.username}`,
                iconURL: targetUser.displayAvatarURL({ dynamic: true, size: 32 })
            })
            // Imposta l'avatar dell'utente come thumbnail, più grande (256x256) per visibilità
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
            // Sposta l'ID utente nella descrizione per una vista più compatta e immediata
            .setDescription(`**ID Utente:** \`${targetUser.id}\``)
            .addFields(
                { name: 'Nickname nel Server', value: `\`${nickname}\``, inline: true },
                { name: 'È un Bot?', value: targetUser.bot ? 'Sì' : 'No', inline: true }, // Aggiunto per indicare se è un bot
                { name: '\u200B', value: '\u200B', inline: true }, // Campo vuoto per allineamento su 3 colonne

                // Date con timestamp di Discord per formati leggibili e dinamici
                { name: 'Account Discord Creato', value: `<t:${accountCreatedTimestamp}:F> (<t:${accountCreatedTimestamp}:R>)`, inline: false },
                { name: 'Unito al Server', value: `<t:${joinedServerTimestamp}:F> (<t:${joinedServerTimestamp}:R>)`, inline: false },

                { name: 'Sta Boostando il Server?', value: `\`${isBoosting}\``, inline: true },
                { name: '\u200B', value: '\u200B', inline: true }, // Campo vuoto per allineamento
                { name: '\u200B', value: '\u200B', inline: true }, // Ancora un campo vuoto
                
                // Ruoli (non inline per maggiore leggibilità se ce ne sono molti)
                { name: `Ruoli (${targetMember.roles.cache.filter(r => r.id !== interaction.guild.id).size})`, value: roles.length > 0 ? `${roles}` : 'Nessuno', inline: false }
            )
            // Aggiungi un footer con chi ha richiesto l'info e un timestamp corrente
            .setFooter({
                text: `Info richiesta da ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp(); // Aggiunge l'ora corrente nel footer dell'embed

        // Invia la risposta finale con l'embed
        await interaction.editReply({ embeds: [embed] });
    }
};