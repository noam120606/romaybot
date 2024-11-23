module.exports = {
    name: 'monnaie',
    alias: ['monney', 'money'],
    description: 'Voir votre monnaie',
    async run(bot, data, args) {
        let monnaie = await bot.twitch.levels.get(data['user-id']);
        if (!monnaie) monnaie = 0;
        bot.twitch.say(data.channel, `@${data.username} Tu as ${monnaie} ${bot.config.twitch.monnaie.symbol}`);
    }
}