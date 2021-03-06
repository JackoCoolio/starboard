import { TextChannel, Client, Message } from "discord.js";

require('dotenv').config();

// https://discordapp.com/oauth2/authorize?client_id=429707241839656961&scope=bot&permissions=1140968512
// https://discordapp.com/oauth2/authorize?client_id=429707241839656961&scope=bot&permissions=1140976704

const Discord = require('discord.js');
const client: Client = new Discord.Client();

import { Starboard } from "./starboard";

const DataManager = require('./data/manager.ts');

let boards = {};

client.on('error', console.error);

client.on('ready', () => {
    client.guilds.forEach((guild, id) => {
        if (DataManager.doesGuildExist(id)) {
            let chan = guild.channels.get(DataManager.getGuild(id).channel);
            boards[id] = new Starboard(chan as TextChannel);
        } else {
            DataManager.registerGuild(id, () => {
                console.log(`Registered guild with id <${id}>`);
                DataManager.addGuildEmoji(guild.id, '%E2%AD%90');
            });
        }
    });
    console.log('Starboard bot is online!');
});

client.on('guildCreate', guild => {
    DataManager.registerGuild(guild.id, () => {
        console.log(`Registered guild with id <${guild.id}>`);
    });
});

client.on('guildDelete', guild => {
    DataManager.deleteGuild(guild.id, () => {
        console.log(`Deleted guild with id <${guild.id}>`);
    });
});

client.on('messageReactionAdd', (reaction, user) => {
    // Message pinned.
    let guildID = reaction.message.guild.id;

    if (!DataManager.getGuild(guildID).emojis.includes(reaction.emoji.identifier)) return;

    let sb: Starboard = boards[reaction.message.guild.id];
    sb.pinMessage(reaction.message, user).then(() => {
        console.log("Pinned message to Starboard.");
    }).catch(console.error);
});

client.on('message', message => {
    if (message.member.user.bot) return;

    let guildData = DataManager.getGuild(message.guild.id);

    if (!message.content.startsWith(guildData.prefix)) return;

    let cleanSegments = message.cleanContent.split(' ');
    let segments = message.content.split(' ');
    let command = cleanSegments[0].substr(guildData.prefix.length);

    console.log(command.toLocaleUpperCase());

    if (command.toLocaleUpperCase() === 'ADDEMOJI') {
        //DataManager.addEmoji()

    } else if (command.toLocaleUpperCase() === 'SETCHANNEL') {
        let name = cleanSegments[1].toLocaleLowerCase();
        console.log(name.substring(1));
        if (name.startsWith('#')) name = name.substring(1);
        console.log(message.guild.channels);
        let chan = message.guild.channels.find((c: TextChannel) => c.name == name );
        if (chan) {
            DataManager.setChannelID(message.guild.id, chan.id);
            message.channel.send(`Set ${segments[1]} as the starboard channel.`).then(sentMsg => {
                setTimeout(() => {
                    (sentMsg as Message).delete().catch(console.error);
                }, 10000);
            }).catch(console.error);
        } else {
            message.channel.send(`I couldn't locate ${segments[1]}!`).then(sentMsg => {
                setTimeout(() => {
                    (sentMsg as Message).delete().catch(console.error);
                }, 10000);
            }).catch(console.error);
        }
        message.delete().catch(console.error);
    } else if (command.toLocaleUpperCase() === 'TRANSFERPINS') {
        let sb: Starboard = boards[message.guild.id];
        message.channel.send('Fetching and transferring pinned messages...').then(loadingMsg => {
            sb.transferAllPinnedMessages(message.channel as TextChannel, message.member).then(messages => {
                (loadingMsg as Message).delete().catch(console.error);
                message.channel.send(`Transferred ${messages.length} pinned messages!`).then(msg => {
                    setTimeout(() => {
                        (msg as Message).delete().catch(console.error);
                    }, 10000);
                });
            }).catch(console.error);
        }).catch(console.error);
    } else if (command.toLocaleUpperCase() === 'UNLOG') {
        DataManager.unlogPinnedMessage(message.guild.id, cleanSegments[1]).then(() => {
            message.channel.send(`Message with id <${cleanSegments[1]}> was unlogged.`).catch(console.error);
        }).catch(() => {
            message.channel.send(`Message with id <${cleanSegments[1]}> hasn't been logged!`).catch(console.error);
        });
    } else if (['HELLO', 'HI', 'SUPBITCH'].includes(command.toLocaleUpperCase())) {
        message.channel.send('hi \:)').then(response => {
            message.delete().catch(console.error);
            setTimeout(() => {(response as Message).delete().catch(console.error)
            }, 10000);
        }).catch(console.error);
    }
});

// Add set prefix command...

client.login(process.env.DISCORD_TOKEN);
