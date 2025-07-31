const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    // Definizione del comando usando SlashCommandBuilder
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Mostra informazioni dettagliate su un utente del server.')
        .addUserOption(option => // Opzione per selezionare un utente
            option.setName('user')
                .setDescription('Seleziona un utente di cui visualizzare le informazioni (predefinito: te stesso).')
                .setRequired(false)), // Non è obbligatorio specificare un utente

    async execute(interaction) {
        // Differisce la risposta. Questo mostra "Il bot sta pensando..." e dà tempo per elaborare.
        // La risposta finale sarà pubblica, visibile a tutti nel canale.
        await interaction.deferReply(); 

        // **Nota sul Permesso "ManageMessages":**
        // Il tuo codice precedente includeva un controllo per "ManageMessages".
        // I comandi UserInfo sono tipicamente accessibili a tutti gli utenti del server.
        // Ho commentato il controllo qui sotto. Se vuoi che SOLO i moderatori possano usare questo comando,
        // rimuovi i commenti dalle righe qui sotto E anche dalla riga `default_member_permissions`
        // nella sezione `data` di questo modulo.
        /*
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.editReply({ content: '🚫 Solo i moderatori possono usare questo comando.', ephemeral: true });
        }
        */

        // Recupera l'utente target: l'utente specificato nell'opzione, altrimenti l'utente che ha invocato il comando.
        const targetUser = interaction.options.getUser('user') || interaction.user;
        let targetMember;

        try {
            // Cerca l'oggetto GuildMember per l'utente, che contiene informazioni specifiche del server (ruoli, nickname, ecc.).
            targetMember = await interaction.guild.members.fetch(targetUser.id);
        } catch (error) {
            console.error(`Errore nel recupero del membro per l'utente ${targetUser.id}: ${error}`);
            // Se l'utente non viene trovato nel server o c'è un altro errore, informa l'utente.
            return interaction.editReply({ content: '❌ Impossibile trovare l\'utente specificato in questo server.' });
        }

        // --- Preparazione dei Dati per l'Embed ---

        // Ruoli: filtra il ruolo "@everyone", ordina per posizione (i ruoli più alti prima) e menzionali.
        const roles = targetMember.roles.cache
            .filter(role => role.name !== '@everyone')
            .sort((a, b) => b.position - a.position)
            .map(role => `<@&${role.id}>`)
            .join(', ');

        const nickname = targetMember.nickname || 'Nessuno'; // Nickname nel server, se non impostato, "Nessuno"
        const isBoosting = targetMember.premiumSince ? 'Sì' : 'No'; // Controlla se l'utente sta boostando il server

        // Utilizzo dei timestamp di Discord per date dinamiche e localizzate
        // <t:timestamp:F> -> Data e ora complete (es. "1 gennaio 2023 10:00")
        // <t:timestamp:R> -> Tempo relativo (es. "2 giorni fa")
        const accountCreatedTimestamp = Math.floor(targetUser.createdTimestamp / 1000);
        const joinedServerTimestamp = Math.floor(targetMember.joinedTimestamp / 1000);

        // --- Costruzione dell'Embed per una Migliore Grafica ---
        const embed = new EmbedBuilder()
            .setColor('#5865F2') // Un colore blu più vivace o il blu ufficiale di Discord
            // Imposta l'autore dell'embed con il nome utente e l'avatar.
            // Aggiungi un'emoji visiva nel nome per un tocco in più.
            .setAuthor({
                name: `👤 Informazioni Utente: ${targetUser.username}`, // Nome più descrittivo con emoji
                iconURL: targetUser.displayAvatarURL({ dynamic: true, size: 32 })
            })
            // Imposta l'avatar dell'utente come thumbnail, con una dimensione chiara.
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
            // Aggiungi una descrizione iniziale con menzione dell'utente e ID.
            .setDescription(
                `Mostra i dettagli per ${targetUser.toString()} (ID: \`${targetUser.id}\`)\n\n` +
                `**Stato:** ${targetUser.presence ? targetUser.presence.status.toUpperCase() : 'OFFLINE'}` // Mostra lo stato (richiede l'intent GuildPresences)
            )
            .addFields(
                // Informazioni personali e di base (inline per compattezza)
                { name: '📜 Nickname nel Server', value: `\`${nickname}\``, inline: true },
                { name: '🏷️ Username Discord', value: `\`${targetUser.globalName || targetUser.username}\``, inline: true }, // Usa globalName se disponibile
                { name: '🤖 È un Bot?', value: targetUser.bot ? '✅ Sì' : '❌ No', inline: true },

                { name: '\u200B', value: '\u200B', inline: false }, // Campo vuoto per creare una riga di separazione

                // Date importanti (non inline per maggiore leggibilità)
                { name: '🗓️ Account Discord Creato', value: `<t:${accountCreatedTimestamp}:F> (<t:${accountCreatedTimestamp}:R>)`, inline: false },
                { name: '➡️ Unito al Server', value: `<t:${joinedServerTimestamp}:F> (<t:${joinedServerTimestamp}:R>)`, inline: false },

                { name: '\u200B', value: '\u200B', inline: false }, // Campo vuoto per creare una riga di separazione

                // Dettagli specifici del server (inline e poi ruoli a piena larghezza)
                { name: '✨ Sta Boostando il Server?', value: `\`${isBoosting}\``, inline: true },
                { name: '\u200B', value: '\u200B', inline: true }, // Campo vuoto per allineamento
                { name: '\u200B', value: '\u200B', inline: true }, // Campo vuoto per allineamento
                
                { name: `🎭 Ruoli (${targetMember.roles.cache.filter(r => r.id !== interaction.guild.id).size})`, value: roles.length > 0 ? `${roles}` : 'Nessuno', inline: false }
            )
            // Footer con chi ha richiesto l'info e timestamp di generazione
            .setFooter({
                text: `Richiesto da ${interaction.user.username} |`, // Aggiunto | per una leggera separazione
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp(); // Aggiunge l'ora esatta di generazione dell'embed

        // Invia la risposta finale con l'embed
        await interaction.editReply({ embeds: [embed] });
    }
};