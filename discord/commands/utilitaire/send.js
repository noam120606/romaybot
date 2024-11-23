const { SlashCommandBuilder } = require("discord.js")

module.exports = {
    owner: true,
    data: new SlashCommandBuilder()
        .setName('send')
        .setDescription('Envoie un message dans twitch')
        .addStringOption(option => option.setName('message').setDescription('Le message a envoyer').setRequired(true)),

    async run(bot, interaction) {

        const message = interaction.options.getString('message')
        bot.twitch.say(bot.config.twitch.channel, message);

        await interaction.reply({ content: 'Message envoyé', ephemeral: true });
        
    }
}