const { Events } = require('discord.js');
const randint = require('../../functions/randint.js');

module.exports = {
    name: Events.MessageCreate,
    async run(bot, message) {
        if (message.author.bot) return;
        await bot.db.addMonnaie(message.author.id, randint(5, 15), true);
    }
}