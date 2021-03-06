import { Message, TextChannel, RichEmbed, User, GuildMember } from "discord.js";

const DataManager = require('./data/manager.ts');

export class Starboard {

    chan: TextChannel;

    constructor(channel?: TextChannel) {
        this.chan = channel;
    }

    setChannel(channel: TextChannel) {
        this.chan = channel;
    }

    private truncate(content: string): string {
        if (content.length < 1024) return content;
        return content.substring(0, 1021) + '...';
    }

    pinMessage(message: Message, user: User): Promise<Message|Array<Message>> {
        if (!this.chan) {
            return Promise.reject('Unable to pin message to Starboard, because channel is undefined!');
        }

        if (DataManager.isMessagePinned(message.guild.id, message.id)) return Promise.reject('Message is already pinned!');

        // console.log(message.attachments.first().url);
        // console.log(message.attachments.first().proxyURL);

        let embed = new RichEmbed()
        .setAuthor(message.member.nickname || message.member.user.username, message.member.user.displayAvatarURL, message.url)
        .setColor(message.member.colorRole? message.member.colorRole.color : 0x282b30)
        .setTimestamp(message.createdTimestamp)
        .setFooter(`Pinned by ${user.username} in #${(message.channel as TextChannel).name}`);

        if (message.content !== '') {
            embed.addField('Message',this.truncate(message.cleanContent), false);
        }
        
        embed.addField('\u200b', `[\`Jump to Message\`](${message.url})`, true);

        let youtubeMatch = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/ig.exec(message.content);
        if (youtubeMatch) {
            embed.setImage(`https://i3.ytimg.com/vi/${youtubeMatch[1]}/hqdefault.jpg`);
        } else if (message.attachments.size > 0) {
            embed.setImage(message.attachments.first().url || message.attachments.first().proxyURL);
        }

        DataManager.logPinnedMessage(message.guild.id, message.id, true);

        return this.chan.send(embed);
    }

    async transferAllPinnedMessages(channel: TextChannel, transferer: GuildMember): Promise<Message[]> {
        return new Promise((resolve, reject) => {
            channel.fetchPinnedMessages().then(messages => {
                let array = messages.array().reverse();
                let promises = [];
                array.forEach(message => {
                    promises.push(this.transferMessage(message, transferer));
                });
                Promise.all(promises).then(resolve).catch(reject);
            })
        });
        // let messageCollection = await channel.fetchPinnedMessages();
        // let messageArray = messageCollection.array().reverse();
        // let promises = [];
        // messageArray.forEach(message => {
        //     promises.push(this.transferMessage(message, transferer));
        // });
        // return promises;

        // channel.fetchPinnedMessages().then(messageCollection => {
        //     let messageArray = messageCollection.array().reverse();
        //     messageArray.forEach(message => {
        //         this.transferMessage(message, transferer);
        //     });
        // }).catch(console.error);

    }

    transferMessage(message: Message, transferer: GuildMember): Promise<Message|Array<Message>> {
        if (!this.chan) {
            return Promise.reject('Unable to pin message to Starboard, because channel is undefined!');
        }

        if (DataManager.isMessagePinned(message.guild.id, message.id)) return Promise.reject('Message is already pinned!');

        let embed = new RichEmbed()
        .setAuthor(message.member.nickname || message.member.user.username, message.member.user.displayAvatarURL, message.url)
        .setColor(message.member.colorRole? message.member.colorRole.color : 0x282b30)
        .setTimestamp(message.createdTimestamp)
        .setFooter(`Transferred by ${transferer.nickname || transferer.user.username} from #${(message.channel as TextChannel).name}`);

        if (message.content !== '') {
            embed.addField('Message', this.truncate(message.cleanContent), false);
        }
        
        embed.addField('\u200b', `[\`Jump to Message\`](${message.url})`, true);

        let youtubeMatch = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/ig.exec(message.content);
        if (youtubeMatch) {
            embed.setImage(`https://i3.ytimg.com/vi/${youtubeMatch[1]}/hqdefault.jpg`);
        } else if (message.attachments.size > 0) {
            embed.setImage(message.attachments.first().url || message.attachments.first().proxyURL);
        }

        DataManager.logPinnedMessage(message.guild.id, message.id, true);

        return this.chan.send(embed);
    }

}