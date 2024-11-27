module.exports = {
    name: 'logout',
    description: 'Deconnecte tes comptes discord liés',
    async run(bot, data, args) {
        await bot.db.unlink({ twitch: data.username });
        bot.twitch.say(data.channel, `@${data.username} tu as deconnecté tes comptes discord liés`);
    }
}