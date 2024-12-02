const { Events } = require('discord.js');
const randint = require('../../functions/randint.js');

module.exports = {
    name: Events.MessageCreate,
    async run(bot, message) {
        
        if (message.author.bot) return;

        const noMessageChannel = ['1309524945159716884'];
        if (!noMessageChannel.includes(message.channel.id)) return;

        await message.delete();
        
    }
}