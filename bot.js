require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, Collection, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
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

client.commands = new Collection();

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

client.once('ready', async () => {
    console.log(`✅ Bot Online come ${client.user.tag}!`);

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
                    description = `Connettiti al nostro server Java usando questo indirizzo:\n\n\`${serverIP.toUpperCase()}\``;
                    break;
                case 'bedrock':
                    title = 'Minecraft Bedrock Edition IP & Porta';
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

            // Invia la risposta effimera all'utente che ha fatto la selezione
            await interaction.followUp({ 
                content: 'Ecco le informazioni richieste:', 
                embeds: [embed], 
                ephemeral: true 
            });

            // --- NUOVA LOGICA PER RESETTARE IL DROPDOWN NEL MESSAGGIO ORIGINALE ---
            // Ricrea il Select Menu con le opzioni e il placeholder, ma senza valore pre-selezionato
            const resetSelect = new StringSelectMenuBuilder()
                .setCustomId('minecraft_edition_select')
                .setPlaceholder('Scegli l\'edizione di Minecraft...');

            const ipForDesc = 'kappiani.falixsrv.me'; // Per le descrizioni del dropdown
            const portForDesc = '30862';

            resetSelect.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Minecraft Java Edition')
                    .setDescription(`Mostra l'indirizzo IP per Minecraft Java: ${ipForDesc.toUpperCase()}`)
                    .setValue('java'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Minecraft Bedrock Edition')
                    .setDescription(`Mostra l'indirizzo IP e la porta per Minecraft Bedrock: ${ipForDesc.toUpperCase()} (Porta: ${portForDesc})`)
                    .setValue('bedrock'),
            );

            const resetRow = new ActionRowBuilder()
                .addComponents(resetSelect);

            // Modifica il messaggio originale per resettare il dropdown
            await interaction.message.edit({
                components: [resetRow]
            });
            // --- FINE NUOVA LOGICA ---

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