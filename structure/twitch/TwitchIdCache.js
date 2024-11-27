const { Collection } = require('discord.js');

class TwitchIdCache {
    constructor(bot) {
        this.bot = bot;
        this.cache = new Collection();
    };

    async init() {
        const data = await this.bot.db.getUserData();
        if (!data?.length) return;
        for (let i = 0; i < data.length; i++) {
            this.cache.set(data[i].userid, data[i].username);
        }
    }

    async get(id) {
        if (this.cache.has(id)) return this.cache.get(id);
        const user = await this.bot.db.getUsername(id);
        if (!user) return null;
        this.cache.set(id, user);
        return user;
    };

    getUser(id) {
        if (this.cache.has(id)) return this.cache.get(id);
        return null;
    };

    set(id, user) {
        if (this.cache.has(id)) return null;
        this.cache.set(id, user);
        this.bot.db.setId(id, user);
        return user;
    };
}

module.exports = TwitchIdCache;