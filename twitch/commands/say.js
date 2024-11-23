const { description } = require("./test")

module.exports = {
    name: 'say',
    description: 'Envoie un message avec le bot',
    mod: true,
    async run(bot, data, args) {
        bot.twitch.say(data.channel, args.join(' '))
    }
}