const { Collection } = require('discord.js');

class MonnaieManager {
    constructor(bot) {
        this.bot = bot;
        this.cache = new Collection();
    };

    async init() {
        const data = await this.bot.db.getMonnaieData();
        if (!data?.length) return;
        for (let i = 0; i < data.length; i++) {
            this.cache.set(data[i].userid, data[i].username);
        }
    }

    async get(userId) {
        //if (this.cache.has(userId)) return this.cache.get(userId);
        const monnaie = await this.bot.db.getMonnaie(userId);
        if (!monnaie) return null;
        this.cache.set(userId, monnaie);
        return monnaie;
    };

    async set(userid, amount) {
        this.cache.set(userid, amount);
        return await this.bot.db.setMonnaie(userid, amount);
    };

    async add(userid, amount) {
        const current = await this.get(userid);
        return await this.set(userid, amount + current);
    };

    async remove(userid, amount) {
        return await this.add(userid, -amount);
    };

    async getLeaderboard() {
        return await this.bot.db.getLeaderboard();
    };
}

module.exports = MonnaieManager;