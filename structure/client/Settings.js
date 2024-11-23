const { Collection } = require('discord.js');

class Settings {
    constructor(bot) {
        this.bot = bot;
        this.cache = new Collection();
    }

    async init() {
        this.bot.db.query('SELECT * FROM settings;', (err, data) => {
            if (err) throw err;
            for (let i = 0; i < data.length; i++) {
                this.cache.set(data[i].name, data[i].value);
            }
        });
    }

    get(name) {
        return this.cache.get(name);
    }

    set(name, value) {
        const exist = this.get(name);
        this.cache.set(name, value);
        if (exist) this.bot.db.query('UPDATE settings SET value = ? WHERE name = ?;', [value, name]);
        else this.bot.db.query('INSERT INTO settings (name, value) VALUES (?, ?);', [name, value]);
    }
}

module.exports = Settings;