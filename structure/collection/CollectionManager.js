const { cartes, rarity } = require('../../storage/cartes.js');
const Inventory = require('./Inventory.js');
const Trade = require('./Trade.js');
const { Collection } = require('discord.js');
const generateId = require('../../functions/generateId.js');

class CollectionManager {
    constructor(bot) {
        this.bot = bot;
        this.trades = new Collection();
    };

    getCardData(id, newCard=false) {

        const card = cartes.find(card => card.id == id);
        const rarityData = rarity[card.rarity];

        return {
            ...card,
            max: rarityData.max,
            rarityName: rarityData.name,
            rarityColor: rarityData.color,
            newCard,
        };
    };

    createTrade(requesterId, targetId) {
        const tradeID = generateId();
        const trade = new Trade(this.bot, requesterId, targetId, tradeID);
        this.trades.set(tradeID, trade);
        return trade;
    };
    getTrade(tradeId) {
        return this.trades.get(tradeId);
    }
    deleteTrade(tradeId) {
        this.trades.delete(tradeId);
    }

    async getInventory(userId) {
        const inv = new Inventory(this.bot, userId);
        await inv.init();
        return inv;
    };

    async giveRandomCard(userId, r) {
        const arrayOfIds = cartes.filter(card => card.rarity == r).map(card => card.id);
        const dropableCards = typeof rarity[r].max == 'number' ? await this.bot.db.getDropableCards(arrayOfIds, rarity[r].max) : arrayOfIds;
        if (dropableCards.length == 0) return this.giveRandomCard(userId, parseInt(r)-1);
        const cardId = dropableCards[Math.floor(Math.random() * dropableCards.length)];
        const ancienNnbnCards = await this.bot.db.giveCard(userId, cardId);
        this.bot.log(`Card ${cardId} dropped in pack to ${userId}`, 'log');
        return this.getCardData(cardId, ancienNnbnCards == 0);
    };
};

module.exports = CollectionManager;