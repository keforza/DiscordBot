require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { ephemeralReply } = require('./utils/replyHandler'); // Importa la funzione helper
const http = require('node:http'); // <<< AGGIUNTA QUESTA LINEA

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection(); // Inizializza la Collection dei comandi

const commandsPath = path.join(__dirname, 'commands'); // Percorso alla cartella 'commands'
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js')); // Leggi i file .js

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath); // Importa il file del comando
    // Controlla che il comando abbia le proprietà 'data' e 'execute'
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command); // Aggiungi il comando alla Collection
    } else {
        console.warn(`[AVVISO] Il comando a ${filePath} manca di una proprietà "data" o "execute" richiesta.`);
    }
}

client.once('ready', async () => {
    console.log(`✅ Bot Online come ${client.user.tag}!`);

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

    // Raccogli tutti i dati dei comandi dalla Collection per registrarli
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
    if (interaction.isChatInputCommand()) { // Usa isChatInputCommand per i comandi slash
        if (interaction.user.bot) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.warn(`Comando non trovato: ${interaction.commandName}`);
            return interaction.reply(ephemeralReply('❌ Questo comando non è stato trovato o è obsoleto.'));
        }

        try {
            // Passa l'interazione e la funzione ephemeralReply al comando
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
    // ================================================================
    // NUOVA SEZIONE PER GESTIRE LE SELEZIONI DEI DROPDOWN MENU (StringSelectMenu)
    // ================================================================
    else if (interaction.isStringSelectMenu()) { // Controlla se l'interazione è un Select Menu
        // Verifica se l'ID personalizzato del dropdown corrisponde a quello che abbiamo definito nel comando /minecraftip
        if (interaction.customId === 'minecraft_edition_select') { 
            // Riconosci l'interazione per evitare errori "Interaction Failed", ma senza mostrare "Thinking..."
            await interaction.deferUpdate(); 

            // Ottieni il valore selezionato dall'utente (i dropdown restituiscono un array, prendiamo il primo elemento)
            const selectedEdition = interaction.values[0]; 

            const serverIP = 'kappiani.falixsrv.me'; // L'indirizzo IP del server
            const bedrockPort = '30862'; // La porta specifica per Bedrock

            let title = '';
            let description = '';
            const color = '#2ECC71'; // Colore verde per l'embed

            // Logica per determinare la risposta in base all'edizione scelta
            switch (selectedEdition) {
                case 'java':
                    title = 'Minecraft Java Edition IP';
                    description = `Connettiti al nostro server Java usando questo indirizzo:\n\n\`${serverIP.toUpperCase()}\``;
                    break;
                case 'bedrock':
                    title = 'Minecraft Bedrock Edition IP & Porta';
                    description = `Connettiti al nostro server Bedrock usando questo indirizzo e porta:\n\nIndirizzo: ${serverIP}\nPorta: **${bedrockPort}**`;
                    break;
                default:
                    title = 'Errore';
                    description = 'Selezione non valida.';
                    break;
            }

            // Costruisci l'embed con le informazioni sull'IP
            const embed = new EmbedBuilder()
                .setColor(color)
                .setTitle(title)
                .setDescription(description)
                .setThumbnail('https://cdn.discordapp.com/attachments/1291444793058267256/1291444793058267256/minecraft_logo.png'); // Sostituisci con il tuo URL del logo

            // Modifica il messaggio originale del dropdown con l'embed contenente l'IP.
            // Rimuoviamo anche il dropdown dal messaggio originale per pulizia.
            await interaction.editReply({ 
                content: 'Ecco le informazioni richieste:', // Puoi mettere un testo qui o lasciarlo vuoto
                embeds: [embed], 
                components: [] // Importante: rimuove il dropdown dopo la selezione
            });
        }
    }
    // ================================================================
    // FINE SEZIONE DI GESTIONE DEI DROPDOWN MENU
    // ================================================================
});

client.login(process.env.DISCORD_BOT_TOKEN);

// <<< AGGIUNTA QUESTA SEZIONE PER IL SERVER HTTP
const PORT = process.env.PORT || 3000; // Render imposterà process.env.PORT automaticamente

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is alive!'); // Messaggio di conferma per il ping
}).listen(PORT, () => {
    console.log(`✅ Server HTTP in ascolto sulla porta ${PORT}`);
});