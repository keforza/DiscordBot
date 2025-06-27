require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, Collection, ActivityType } = require('discord.js'); // Added ActivityType here!
const fs = require('node:fs');
const path = require('node:path');
const { ephemeralReply } = require('./utils/replyHandler');
const http = require('node:http');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection(); // Per i comandi slash
client.selectMenus = new Collection(); // NUOVO: Per i gestori dei Select Menu

// Caricamento dei Comandi Slash dalla cartella 'commands'
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.warn(`[AVVISO] Il comando a ${filePath} manca di una proprietà "data" o "execute" richiesta.`);
    }
}

// NUOVO: Caricamento dei Gestori dei Select Menu dalla cartella 'interactions'
const interactionsPath = path.join(__dirname, 'interactions');
const interactionFiles = fs.readdirSync(interactionsPath).filter(file => file.endsWith('.js'));

for (const file of interactionFiles) {
    const filePath = path.join(interactionsPath, file);
    const selectMenuHandler = require(filePath);
    // Assicurati che l'handler abbia un customId e un metodo execute
    if ('customId' in selectMenuHandler && 'execute' in selectMenuHandler) {
        client.selectMenus.set(selectMenuHandler.customId, selectMenuHandler);
    } else {
        console.warn(`[AVVISO] Il gestore di select menu a ${filePath} manca di una proprietà "customId" o "execute" richiesta.`);
    }
}


client.once('ready', async () => {
    console.log(`✅ Bot Online come ${client.user.tag}!`);

    // --- IMPOSTAZIONE ATTIVITÀ DEL BOT QUI ---
    client.user.setActivity('kappiani.serveminecraft.net', { type: ActivityType.Playing });
    // Puoi anche provare altre opzioni come:
    // client.user.setActivity('la community di Kappiani', { type: ActivityType.Watching });
    // client.user.setActivity('Benvenuti su Kappiani! ✨', { type: ActivityType.Custom });
    // --- FINE IMPOSTAZIONE ATTIVITÀ ---

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

    const commandsToRegister = [];
    for (const command of client.commands.values()) {
        commandsToRegister.push(command.data);
    }

    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commandsToRegister }
        );
        console.log('✅ Comandi globali registrati con successo.');
    } catch (error) {
        console.error('❌ Errore nel registrare i comandi globali:', error);
    }
});

client.on('interactionCreate', async (interaction) => {
    // Gestione dei comandi Slash (ChatInputCommand)
    if (interaction.isChatInputCommand()) {
        if (interaction.user.bot) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.warn(`Comando non trovato: ${interaction.commandName}`);
            return interaction.reply(ephemeralReply('❌ Questo comando non è stato trovato o è obsoleto.'));
        }

        try {
            await command.execute(interaction, ephemeralReply);
        } catch (error) {
            console.error('Errore nell\'esecuzione del comando:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(ephemeralReply('C\'è stato un errore nell\'esecuzione di questo comando!'));
            } else {
                await interaction.reply(ephemeralReply('C\'è stato un errore nell\'esecuzione di questo comando!'));
            }
        }
    } 
    // NUOVO: Gestione dei Select Menu (Component Interactions)
    else if (interaction.isStringSelectMenu()) {
        // Cerca il gestore nella Collection selectMenus usando il customId
        const selectMenuHandler = client.selectMenus.get(interaction.customId);

        if (!selectMenuHandler) {
            console.warn(`Nessun gestore trovato per il select menu con customId: ${interaction.customId}`);
            return interaction.deferUpdate(); // Riconosci l'interazione per evitare errori, anche se non c'è un handler specifico
        }

        try {
            await selectMenuHandler.execute(interaction); // Esegui il gestore del select menu
        } catch (error) {
            console.error('Errore nell\'esecuzione del gestore del select menu:', error);
            // Gestione errori per i componenti (es. se la deferUpdate fallisce o followUp)
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(ephemeralReply('C\'è stato un errore nell\'elaborazione della tua selezione!'));
            } else {
                // Questo caso è meno probabile per i select menu che usano deferUpdate()
                console.error('Interazione del select menu non gestita correttamente dopo l\'errore.');
            }
        }
    }
    // Puoi aggiungere altri `else if` per button.isButton(), isModalSubmit() ecc.
});

client.login(process.env.DISCORD_BOT_TOKEN);

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is alive!');
}).listen(PORT, () => {
    console.log(`✅ Server HTTP in ascolto sulla porta ${PORT}`);
});