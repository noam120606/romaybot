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
        setInterval(async () => {
            await this.syncToDb();
        }, 5 * 60 * 1000);
    }

    async syncToDb() {
        if (this.cache.size === 0) return;
        this.bot.log(`Syncing ${this.cache.size} monnaies to database`, 'debug');
        this.cache.forEach((monnaie, userId) => {
            if (!userId) return;
            this.bot.db.setMonnaie(userId, monnaie)
        });
        this.cache.clear();
    }

    async get(userId, discord=false) {
        if (discord) userId = this.bot.links.get(userId);
        if (!userId) return null;
        if (this.cache.has(userId)) return this.cache.get(userId);
        const monnaie = await this.bot.db.getMonnaie(userId);
        if (!monnaie) return 0;
        this.cache.set(userId, monnaie);
        return parseInt(monnaie);
    };

    async set(userId, amount, discord=false) {
        if (discord) userId = this.bot.links.get(userId);
        this.cache.set(userId, amount);
    };

    async add(userId, amount, discord=false) {
        const current = await this.get(userId, discord);
        return await this.set(userId, parseInt(amount) + parseInt(current), discord);
    };

    async remove(userId, amount, discord=false) {
        return await this.add(userId, -parseInt(amount), discord);
    };

    async getLeaderboard() {
        return await this.bot.db.getLeaderboard();
    };
}

module.exports = MonnaieManager;