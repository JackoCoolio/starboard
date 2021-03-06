# Starboard
Starboard is a Discord bot that watches for star emoji reactions. When someone reacts to a message with a star emoji, that message is added to the designated Starboard channel.

# Installation
1. `git clone https://github.com/JackoCoolio/starboard`
2. `npm install`
3. Create a `.env` file that looks like `DISCORD_TOKEN=<your Discord bot token>`
4. Run `npm run start` to start the bot

# Commands
Starboard's command prefix is `sb!`.
- `setchannel <channel>` - Sets the Starboard channel on the server.
- `transferpins` - Converts all of the Discord pins in the channel to Starboard pins.
