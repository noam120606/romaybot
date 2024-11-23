module.exports = {
    name: 'toggle',
    description: 'Modifie des paramètres du bot',
    owner: true,
    async run(bot, data, args) {

        if (args.length < 2) return;
        const name = args[0].toLowerCase();
        const value = args[1].toLowerCase();
        
        bot.settings.set(name, value);

        bot.twitch.say(data.channel, `@${data.username} paramètre modifié avec succès !`);

    }
}