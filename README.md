# 🤖 DiscordBot

A personal Discord bot developed in **Node.js** using **discord.js v14**.

The bot was created as a personal project and includes several useful commands and utilities for managing and interacting with a Discord server.

## ✨ Features

The bot currently includes several commands, including:

* 🎌 Anime
* 🗑️ Message deletion
* ℹ️ Server information
* 📖 Manga
* 😂 Memes
* ⛏️ Minecraft server information
* 🔇 Mute / Unmute
* 🏓 Ping
* 🐱 Pokémon
* 🎮 Twitch information
* 👤 User information
* ▶️ YouTube information

Commands are organized inside the `commands/` directory.

## 🛠️ Technologies

* [Node.js](https://nodejs.org/)
* [discord.js](https://discord.js.org/)
* Axios
* DeepL Node
* dotenv
* node-fetch

The project uses `discord.js` 14 and Node.js to run the bot.

## 📁 Project Structure

```text
DiscordBot/
├── commands/
│   ├── anime.js
│   ├── delete.js
│   ├── infoserver.js
│   ├── manga.js
│   ├── meme.js
│   ├── minecraftip.js
│   ├── mute.js
│   ├── ping.js
│   ├── pokemon.js
│   ├── twitch.js
│   ├── unmute.js
│   ├── userinfo.js
│   └── youtube.js
│
├── interactions/
├── utils/
├── bot.js
├── package.json
├── package-lock.json
└── .gitignore
```

## 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/keforza/DiscordBot.git
cd DiscordBot
```

Install the dependencies:

```bash
npm install
```

## 🔐 Configuration

Create a `.env` file in the root directory and add the required Discord bot credentials:

```env
TOKEN=your_discord_bot_token
```

> **Never share your bot token or commit your `.env` file to GitHub.**

Make sure your `.env` file is included in `.gitignore`.

## ▶️ Run the Bot

Start the bot with:

```bash
npm start
```

The `start` script runs `node bot.js`.

You can also run it directly:

```bash
node bot.js
```

## 📜 License

This project is licensed under the **ISC License**.

## 👤 Author

**K3Forza**

GitHub: [@keforza](https://github.com/keforza)

---

⭐ Feel free to explore, modify and improve the project or if u need help feel free to write in the **Issue** section.