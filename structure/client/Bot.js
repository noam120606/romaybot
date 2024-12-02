const { Client, IntentsBitField, Collection } = require('discord.js');
const { readdirSync } = require('fs');
const TwitchBot = require('../twitch/TwitchAccount.js');
const Database = require('../utils/Database.js');
const CollectionManager = require('../collection/CollectionManager.js');
const Settings = require('./Settings.js');
const Logger = require('../utils/Logger.js');
const Webserver = require('../utils/Webserver.js');
const config = require('../../config.js');

class Bot extends Client {
    constructor() {
        super({
            intents: new IntentsBitField(process.env.DISCORD_INTENTS),
        });
        this.config = config;
        this.dev = config.dev;
        this.primary = "#ff0000";
        this.db = new Database(this);
        this.twitch = new TwitchBot(this);
        this.settings = new Settings(this);
        this.cards = new CollectionManager(this);
        this.web = new Webserver(this);
        this.commands = new Collection();
        this.interactions = new Collection();
        this.links = new Collection();
    }

    async start() {
        await this.twitch.start();
        await this.settings.init();
        await this.loadLinedAccounts();
        await this.loadEvents();
        await this.loadInteractions();
        await this.loadCommands();
        await this.web.start();
        this.login(process.env.DISCORD_TOKEN)
    }

    async loadLinedAccounts() {
        const accounts = await this.db.getLinks();
        accounts.forEach(account => this.links.set(account.discord, account.twitch));
        this.log(`Loaded ${accounts.length} linked accounts`, 'debug');
    }

    log(message, type='log') {
        const logger = new Logger();
        logger.log(message, type);
    }

    async loadEvents() {
        const eventFiles = readdirSync('./discord/events');
        let count = 0;
        for (const file of eventFiles) {
            const event = require(`../../discord/events/${file}`);
            if (typeof event.name === 'string') {
                this.on(event.name, event.run.bind(null, this));
                count++;
            } else event.name.forEach(name => {
                this.on(name, event.run.bind(null, this));
                count++;
            });
        };
        this.log(`Loaded ${count} events`, 'debug');
    };

    async loadCommands() {
        const commandDirs = readdirSync('./discord/commands');
        let count = 0;
        for (const dir of commandDirs) {
            const commandFiles = readdirSync(`./discord/commands/${dir}`);
            for (const file of commandFiles) {
                const command = require(`../../discord/commands/${dir}/${file}`);
                this.commands.set(command.data.name, command);
                count++;
            }
        };
        this.log(`Loaded ${count} commands`, 'debug');
    };

    async loadInteractions() {
        const interactionDirs = readdirSync('./discord/interactions');
        let count = 0;
        for (const dir of interactionDirs) {
            const interactionFiles = readdirSync(`./discord/interactions/${dir}`);
            for (const file of interactionFiles) {
                const interaction = require(`../../discord/interactions/${dir}/${file}`);
                this.interactions.set(interaction.name, interaction);
                count++;
            }
        };
        this.log(`Loaded ${count} interactions`, 'debug');
    }

    async save() {
        await this.twitch.levels.syncToDb();
    }
}

module.exports = Bot;