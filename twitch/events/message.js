const randint = require('../../functions/randint.js');

module.exports = async (bot, data) => {

    if (bot.dev) return;

    // ajout monnaie a l'utilisateur
    const monnaie = data.subscriber ? randint(10, 20) : randint(5, 15);
    bot.twitch.levels.add(data['user-id'], monnaie);

    // stockage id-username
    bot.twitch.users.set(data['user-id'], data.username);

    // gestion commandes
    if ((!data.message.startsWith(bot.config.twitch.prefix)) && !bot.twitch.no_prefist.includes(data.message.split(' ')[0])) return;

    const splited = data.message.startsWith(bot.config.twitch.prefix) ? data.message.slice(bot.config.twitch.prefix.length).split(' ') : data.message.split(' ');
    const command = splited[0].toLowerCase();
    const args = splited.slice(1);
    
    if(bot.twitch.commands.has(command)) {
        const cmd = bot.twitch.commands.get(command);
        if (cmd.owner && !data.owner) return;
        if (cmd.mod && !data.mod) return;

        await cmd.run(bot, data, args);
    }
}