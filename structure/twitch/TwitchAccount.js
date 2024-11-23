const { Collection } = require('discord.js');
const { Client } = require('tmi.js');
const { readdirSync } = require('fs');
const TwitchIdCache = require('./TwitchIdCache.js');
const MonnaieManager = require('../leveling/MonnaieManager.js');
const TwitchRandomChatEvents = require('./TwitchRandomChatEvents.js');
const EventEmitter = require('events');
const config = require('../../config.js');

class TwitchBot extends Client {
    constructor(bot) {
        super({
            options: { debug: false },
            identity: {
                username: process.env.TWITCH_USERNAME,
                password: process.env.TWITCH_PASSWORD
            },
            channels: config.twitch.channels
        });
        this.connect().catch(console.error);
        this.config = config;
        this.bot = bot;
        this.db = bot.db;
        this.users = new TwitchIdCache(bot);
        this.levels = new MonnaieManager(bot);
        this.commands = new Collection();
        this.events = new EventEmitter();
        // this.chatEvents = new TwitchRandomChatEvents(bot);
        this.msgCache = [];
        this.no_prefist = [];
    }

    async start() { 
        await this.users.init();
        await this.loadCommands();
        await this.loadEvents();
    }

    async loadCommands() {
        const commandFiles = readdirSync('./twitch/commands/');
        let count = 0;
        for (const file of commandFiles) {
            const cmd = require(`../../twitch/commands/${file}`);
            if (cmd.name.startsWith('#')) {
                this.no_prefist.unshift(cmd.name.slice(1));
                cmd.name.slice(1);
            };
            this.commands.set(cmd.name.toLowerCase(), cmd);
            if (cmd.alias) cmd.alias.forEach(alias => {
                if (alias.startsWith('#')) {
                    this.no_prefist.unshift(alias.slice(1));
                    alias.slice(1);
                };
                this.commands.set(alias.startsWith('#') ? alias.slice(1).toLowerCase() : alias.toLowerCase(), cmd)
            });
            count++;
        }
        this.bot.log(`Loaded ${count} twitch commands`, 'debug');
    }

    async loadEvents() {
        const messageEventFile = require('../../twitch/events/message.js');
        this.on('message', async (channel, tags, message, self) => {
            if (self) return;
            const data = {
                channel,
                message,
                ...tags,
                owner: this.config.twitch.owners.includes(tags.username),
                date: Date.now(),
            }
            console.log(data);
            await messageEventFile(this.bot, data);
            this.events.emit('message', data);
            this.msgCache.push(data);
            this.msgCache = this.msgCache.slice(-100);
        });
        this.bot.log(`Loaded twitch messages event`, 'debug');
    }

}

module.exports = TwitchBot;