const { Collection } = require('discord.js');
const { EventEmitter } = require('events');


class TwitchMessageCollector extends EventEmitter {
    constructor(bot, options = {}) {
        super();
        this.bot = bot;

        this.filter = options.filter || (() => true);
        this.time = options.time===undefined ? 60000 : options.time;
        this.idle = options.idle || false;

        if (this.idle) this.lastUse = null;

        this.bot.twitch.events.on('message', msg => {
            if (!this.filter(msg)) return this.emit('ignore', msg);
            if (this.idle) this.lastUse = Date.now();
            this.emit('collect', msg)
        });

        if (this.time) setTimeout(this.destroy, this.time);
    }

    destroy() {
        this.emit('end');
        this.removeAllListeners('collect');
    }
}

module.exports = TwitchMessageCollector;