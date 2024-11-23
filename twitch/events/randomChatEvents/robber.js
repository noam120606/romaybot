const TwitchMessageCollector = require('../../../structure/twitch/TwitchMessageCollector.js');

module.exports = {
    name: 'robber',
    async run(bot) {
        const blacklisted = ['romaykos', 'wizebot'];
        const msgArray = bot.twitch.msgCache.filter(m => !blacklisted.includes(m.username));
        const msgId = Math.floor(Math.random() * bot.twitch.msgCache.length > 10 ? 10 : bot.twitch.msgCache.length);
        const userMessage = msgArray[msgId];
        const lastUserMessage = msgArray[msgId+1];

        const userMonnaie = await bot.twitch.levels.get(userMessage['user-id']);
    }
}