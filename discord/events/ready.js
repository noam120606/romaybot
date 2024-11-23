const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    async run(bot) {

        bot.application.commands.set(bot.commands.map(cmd => cmd.data));

        bot.log(`Logged in discord as ${bot.user.username}`, 'ready');

    }
}