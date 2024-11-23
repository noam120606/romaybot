const { hidden } = require("colors")

module.exports = {
    name: 'test',
    description: 'test',
    owner: true,
    hidden: true,
    async run(bot, data, args) {
        bot.twitch.say(data.channel, `msg1\nmsg2\nmsg3`)
    }
}