const randint = require('../../functions/randint.js');

module.exports = {
    name: 'roulette',
    alias: ['#romayk1ROULETTE'],
    description: 'Jouez au jeu de la roulette',

    async run(bot, data, args) {

        if (bot.settings.get('roulette') == 'off' && !data.owner) return bot.twitch.say(data.channel, `Le jeu de la roulette est actuellement fermé`);

        const utilisation = `@${data.username} Utilisation: ${data.message.split(' ')[0]} <mise> <rouge/noir/vert>`;

        if (args.length < 2) return bot.twitch.say(data.channel, utilisation);

        const mise = parseInt(args[0]);
        if (isNaN(mise)) return bot.twitch.say(data.channel, utilisation);
        if (mise < 100) return bot.twitch.say(data.channel, `@${data.username} Vous devez mettre une mise supérieur ou égale à 100`);
        if (mise > await bot.twitch.levels.get(data['user-id'])) return bot.twitch.say(data.channel, `@${data.username} Vous n'avez pas assez de monnaie`);

        const couleur = args[1].toLowerCase();
        if (!['rouge', 'noir', 'vert'].includes(couleur)) return bot.twitch.say(data.channel, utilisation);
        
        const num = randint(0, 36);
        let roulette;
        if (num % 2 == 0) roulette = 'noir';
        if (num % 2 == 1) roulette = 'rouge';
        if (num == 0) roulette = 'vert';

        let string = `@${data.username} | La roulette tombe sur `;
        if (roulette == 'noir') string += `${num} (⚫ Noir)`;
        if (roulette == 'rouge') string += `${num} (🔴 Rouge)`
        if (roulette == 'vert') string += `${num} (🟢 Vert)`;

        bot.twitch.levels[roulette == couleur ? 'add' : 'remove'](data['user-id'], roulette == 'vert' && roulette == couleur ? mise*50 : mise);
        bot.twitch.say(data.channel, `${string} | Vous avez ${roulette == couleur ? 'gagné' : 'perdu'} ${roulette == 'vert' && roulette == couleur ? mise*50 : mise} ${bot.config.twitch.monnaie.symbol} !`);

    }
}