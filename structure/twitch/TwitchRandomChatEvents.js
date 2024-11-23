const { Collection } = require('discord.js');
const { readdirSync } = require('fs');

class TwitchRandomChatEvents {
    constructor(bot, options={}) {
        this.bot = bot;
        this.events = new Collection();
        this.interval = options.interval || 15 * 60 * 1000;
        this.loadEvents();

        setInterval(() => {
            this.execute(this.events.random().name);
        }, this.interval);
    }

    loadEvents() {
        const eventFiles = readdirSync('./twitch/events/randomChatEvents');
        let count = 0;
        for (const file of eventFiles) {
            const event = require(`../../twitch/events/randomChatEvents/${file}`);
            this.events.set(event.name, event.run.bind(null, this));
            count++;
        };
        this.bot.log(`Loaded ${count} random chat events`, 'debug');
    }

    async run(name) {
        const event = this.events.get(name);
        await event.run(this.bot);
    }
}

module.exports = TwitchRandomChatEvents;