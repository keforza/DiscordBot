require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { ephemeralReply } = require('./utils/replyHandler'); // Importa la funzione helper
const http = require('node:http');

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
    // Gestione delle interazioni dei dropdown menu (StringSelectMenu)
    else if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'minecraft_edition_select') { 
            await interaction.deferUpdate(); 

            const selectedEdition = interaction.values[0]; 

            const serverIP = 'kappiani.falixsrv.me';
            const bedrockPort = '30862';

            let title = '';
            let description = '';
            const color = '#2ECC71'; 
            
            switch (selectedEdition) {
                case 'java':
                    title = 'Minecraft Java Edition IP';
                    // IP Java tutto in maiuscolo e in backtick
                    description = `Connettiti al nostro server Java usando questo indirizzo:\n\n\`${serverIP.toUpperCase()}\``;
                    break;
                case 'bedrock':
                    title = 'Minecraft Bedrock Edition IP & Porta';
                    // IP Bedrock tutto in maiuscolo e in backtick, Porta in backtick e grassetto
                    description = `Connettiti al nostro server Bedrock usando questo indirizzo e porta:\n\nIndirizzo: \`${serverIP.toUpperCase()}\`\nPorta: \`**${bedrockPort}**\``;
                    break;
                default:
                    title = 'Errore';
                    description = 'Selezione non valida.';
                    break;
            }

            const embed = new EmbedBuilder()
                .setColor(color)
                .setTitle(title)
                .setDescription(description)
                .setThumbnail('https://cdn.discordapp.com/attachments/1291444793058267256/1291444793058267256/minecraft_logo.png');

            await interaction.editReply({ 
                content: 'Ecco le informazioni richieste:', 
                embeds: [embed], 
                components: [] 
            });
        }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is alive!');
}).listen(PORT, () => {
    console.log(`✅ Server HTTP in ascolto sulla porta ${PORT}`);
});